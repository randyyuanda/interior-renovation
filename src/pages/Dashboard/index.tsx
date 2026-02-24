import {
  Box,
  Typography,
  Paper,
  Chip,
  Avatar,
  Grid,
  useTheme,
  alpha,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Person,
  AdminPanelSettings,
  Group,
  Brush,
  TrendingUp,
} from "@mui/icons-material";
import { useAuth } from "../../store/authStore";
import MainLayout from "../../components/MainLayout";
import { useEffect, useState, useMemo } from "react";
import { getHomeOwnerApi } from "../../api/homeOwnerApi";
import { getInteriorDesignersApi } from "../../api/interiorDesignerApi";
import type { HomeOwner } from "../../models/homeOwner";
import type { InteriorDesigner } from "../../models/interiorDesigner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#1dbec1", "#FF8042", "#ffbb28", "#a1321e", "#8884d8"];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function Dashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isSuperAdmin = user?.role === "superadmin";
  const [homeOwners, setHomeOwners] = useState<HomeOwner[]>([]);
  const [designers, setDesigners] = useState<InteriorDesigner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getHomeOwnerApi(), getInteriorDesignersApi()])
      .then(([ownersData, designersData]) => {
        setHomeOwners(ownersData);
        setDesigners(designersData);
      })
      .catch((err) => console.error("Dashboard data fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const { stats, chartData, propertyData } = useMemo(() => {
    const totalDesigners = designers.length;
    const totalOwners = homeOwners.length;
    const totalRevenue = homeOwners.reduce(
      (sum, owner) => sum + (owner.renoBudget || 0),
      0,
    );
    const monthlyMap: Record<string, { projects: number; revenue: number }> =
      {};
    MONTHS.forEach((m) => (monthlyMap[m] = { projects: 0, revenue: 0 }));

    homeOwners.forEach((owner) => {
      if (owner.renoDate) {
        const date = new Date(owner.renoDate);
        const month = MONTHS[date.getMonth()];
        if (monthlyMap[month]) {
          monthlyMap[month].projects += 1;
          monthlyMap[month].revenue += owner.renoBudget || 0;
        }
      }
    });

    const chartData = MONTHS.map((name) => ({
      name,
      projects: monthlyMap[name].projects,
      revenue: monthlyMap[name].revenue,
    }));

    const propMap: Record<string, number> = {};
    homeOwners.forEach((owner) => {
      const type = owner.propertyType || "Other";
      propMap[type] = (propMap[type] || 0) + 1;
    });

    const propertyData = Object.entries(propMap).map(([name, count]) => ({
      name,
      value: totalOwners > 0 ? Math.round((count / totalOwners) * 100) : 0,
    }));

    const stats = [
      {
        title: "Designers",
        value: totalDesigners.toLocaleString(),
        icon: <Brush />,
        color: "#00c49f",
      },
      {
        title: "Home Owners",
        value: totalOwners.toLocaleString(),
        icon: <Group />,
        color: "#ffbb28",
      },
      {
        title: "Total Revenue",
        value: `$${(totalRevenue / 1000).toLocaleString()}k`,
        icon: <TrendingUp />,
        color: "#008587",
      },
    ];

    return { stats, chartData, propertyData };
  }, [homeOwners, designers]);

  if (loading) {
    return (
      <MainLayout
        title="Admin Dashboard"
        icon={<DashboardIcon sx={{ fontSize: 32 }} />}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Admin Dashboard"
      icon={<DashboardIcon sx={{ fontSize: 32 }} />}
    >
      <Paper
        sx={{
          p: { xs: 3, sm: 4 },
          mb: 4,
          borderRadius: 4,
          background: isDark
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.background.paper, 0.1)})`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, #fff)`,
          display: "flex",
          alignItems: "center",
          gap: 3,
          flexWrap: "wrap",
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
          }}
        >
          <Person sx={{ fontSize: 40 }} />
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h4"
            fontWeight={800}
            color="text.primary"
            gutterBottom
          >
            Welcome, {user?.email.split("@")[0]}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={isSuperAdmin ? "SUPERADMIN ACCESS" : "ADMIN ACCESS"}
              color={user?.role === "superadmin" ? "error" : "info"}
              size="small"
              icon={<AdminPanelSettings />}
              sx={{ fontWeight: 800, borderRadius: "6px" }}
            />
            <Typography variant="body2" color="text.secondary">
              Session active • {new Date().toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid key={stat.title} size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 3, height: "100%", borderRadius: 4 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    display: "flex",
                    bgcolor: alpha(stat.color, 0.1),
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </Box>
              </Box>
              <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
                {stat.value}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={500}
              >
                {stat.title}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={70}
                sx={{
                  mt: 2,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: alpha(stat.color, 0.1),
                  "& .MuiLinearProgress-bar": { bgcolor: stat.color },
                }}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 4, minHeight: 400, height: "100%" }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>
              Monthly Project Performance
            </Typography>
            <Box sx={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={theme.palette.divider}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 12,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                    }}
                  />
                  <Bar
                    dataKey="projects"
                    fill={theme.palette.primary.main}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 4, height: "100%" }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>
              Property Distribution
            </Typography>
            <Box sx={{ width: "100%", height: 250 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={propertyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {propertyData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ mt: 2 }}>
              {propertyData.map((entry, index) => (
                <Box
                  key={entry.name}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: COLORS[index % COLORS.length],
                      }}
                    />
                    <Typography variant="body2" fontWeight={600}>
                      {entry.name}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    {entry.value}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>
              Revenue Growth Trend
            </Typography>
            <Box sx={{ width: "100%", height: 200 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={alpha(theme.palette.divider, 0.5)}
                  />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={theme.palette.primary.main}
                    strokeWidth={4}
                    dot={{ r: 6, fill: theme.palette.primary.main }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </MainLayout>
  );
}
