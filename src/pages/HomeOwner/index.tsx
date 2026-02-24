import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Snackbar,
  type SelectChangeEvent,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  ManageAccounts,
  Person,
  Add,
  Edit,
  Delete,
  House,
  MonetizationOn,
  CalendarToday,
  VpnKey,
  Search,
} from "@mui/icons-material";
import { useAuth } from "../../store/authStore";
import MainLayout from "../../components/MainLayout";
import { useEffect, useState } from "react";
import { getInteriorDesignersApi } from "../../api/interiorDesignerApi";
import type { InteriorDesigner } from "../../models/interiorDesigner";
import {
  getHomeOwnerApi,
  createHomeOwnerApi,
  updateHomeOwnerApi,
  deleteHomeOwnerApi,
} from "../../api/homeOwnerApi";
import type { HomeOwner, HomeOwnerPayload } from "../../models/homeOwner";
import SuccessModal from "../../components/SuccessModal";

const PROPERTY_TYPES = ["HDB", "Condo", "Landed"];

export default function HomeOwnerPage() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [homeOwners, setHomeOwners] = useState<HomeOwner[]>([]);
  const [designers, setDesigners] = useState<InteriorDesigner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState<HomeOwnerPayload>({
    name: "",
    phone: "",
    propertyType: "HDB",
    renoBudget: 0,
    renoDate: new Date().toISOString().split("T")[0],
    keyCollected: false,
    interiorDesignerId: undefined,
  });

  const [formErrors, setFormErrors] = useState({
    name: false,
    phone: false,
    propertyType: false,
    renoBudget: false,
    renoDate: false,
  });

  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [successModal, setSuccessModal] = useState({
    open: false,
    title: "",
    message: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const isSuperAdmin = user?.role === "superadmin";

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ownersData, designersData] = await Promise.all([
        getHomeOwnerApi(),
        getInteriorDesignersApi(),
      ]);
      setHomeOwners(ownersData);
      setDesigners(designersData);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load data from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setFormData({
      name: "",
      phone: "",
      propertyType: "HDB",
      renoBudget: 0,
      renoDate: new Date().toISOString().split("T")[0],
      keyCollected: false,
      interiorDesignerId: undefined,
    });
    setFormErrors({
      name: false,
      phone: false,
      propertyType: false,
      renoBudget: false,
      renoDate: false,
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (owner: HomeOwner) => {
    setIsEditMode(true);
    setCurrentId(owner.id);
    setFormData({
      name: owner.name,
      phone: owner.phone,
      propertyType: owner.propertyType,
      renoBudget: owner.renoBudget,
      renoDate: owner.renoDate,
      keyCollected: owner.keyCollected,
      interiorDesignerId: owner.interiorDesignerId,
    });
    setFormErrors({
      name: false,
      phone: false,
      propertyType: false,
      renoBudget: false,
      renoDate: false,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleFormChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<any>,
  ) => {
    const { name, value } = e.target;

    let finalValue: any = value;
    if (name === "renoBudget") {
      finalValue = value === "" ? 0 : Number(value);
    } else if (name === "interiorDesignerId") {
      finalValue = value === "" ? undefined : Number(value);
    }

    setFormData((prev) => ({ ...prev, [name as string]: finalValue }));
    if (typeof value === "string" && value.trim() !== "") {
      setFormErrors((prev) => ({ ...prev, [name as string]: false }));
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSave = async () => {
    const errors = {
      name: formData.name.trim() === "",
      phone: formData.phone.trim() === "",
      propertyType: formData.propertyType.trim() === "",
      renoBudget: formData.renoBudget < 0,
      renoDate: formData.renoDate.trim() === "",
    };

    if (Object.values(errors).some((v) => v)) {
      setFormErrors(errors);
      return;
    }

    try {
      if (isEditMode && currentId !== null) {
        await updateHomeOwnerApi(currentId, formData);
        setSuccessModal({
          open: true,
          title: "Update Successful",
          message: "Home owner records have been updated successfully.",
        });
      } else {
        await createHomeOwnerApi(formData);
        setSuccessModal({
          open: true,
          title: "Registration Successful",
          message: "The new home owner has been added to our records.",
        });
      }
      fetchData();
      handleCloseDialog();
    } catch (err) {
      console.error("Failed to save home owner:", err);
      setSnackbar({
        open: true,
        message: "Failed to save home owner",
        severity: "error",
      });
    }
  };

  const handleOpenDelete = (id: number) => {
    setOwnerToDelete(id);
    setOpenDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!isSuperAdmin) return;
    if (ownerToDelete !== null) {
      try {
        await deleteHomeOwnerApi(ownerToDelete);
        setSnackbar({
          open: true,
          message: "Home Owner deleted successfully",
          severity: "success",
        });
        fetchData();
        const newTotalCount = homeOwners.length - 1;
        if (page > 0 && page * rowsPerPage >= newTotalCount) {
          setPage(page - 1);
        }
      } catch (err) {
        console.error("Failed to delete home owner:", err);
        setSnackbar({
          open: true,
          message: "Failed to delete home owner",
          severity: "error",
        });
      }
    }
    setOpenDeleteConfirm(false);
    setOwnerToDelete(null);
  };

  const getDesignerName = (id?: number) => {
    if (!id) return "Unassigned";
    const designer = designers.find((d) => d.id === Number(id));
    return designer ? designer.name : "Unknown";
  };

  const filteredHomeOwners = homeOwners.filter(
    (o) =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.propertyType.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - filteredHomeOwners.length)
      : 0;
  const paginatedHomeOwners = filteredHomeOwners.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <MainLayout
      title="Home Owner"
      icon={<ManageAccounts sx={{ fontSize: 32 }} />}
      subtitle="Manage Home Owners"
    >
      <Box
        sx={{
          mb: { xs: 3, md: 4 },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={800}
            color="text.primary"
            sx={{ mb: 0.5 }}
          >
            Home Owner
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip
              label={isSuperAdmin ? "SUPERADMIN ACCESS" : "ADMIN ACCESS"}
              color={isSuperAdmin ? "error" : "info"}
              size="small"
              sx={{ fontWeight: 800, borderRadius: "4px" }}
            />
            <Chip
              label={`${homeOwners.length} Total`}
              variant="outlined"
              size="small"
              sx={{
                fontWeight: 700,
                borderRadius: "4px",
                borderColor: "divider",
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            width: { xs: "100%", md: "auto" },
            flexWrap: "wrap",
          }}
        >
          <TextField
            placeholder="Search owners..."
            size="small"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <Search sx={{ color: "text.disabled", mr: 1, fontSize: 20 }} />
              ),
            }}
            sx={{
              width: { xs: "100%", sm: 250 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "background.paper",
              },
            }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreate}
            fullWidth={isMobile}
          >
            Add New
          </Button>
        </Box>
      </Box>

      <Paper
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: { xs: 3, md: 4 },
          borderRadius: 3,
          background: (theme) => alpha(theme.palette.primary.main, 0.1),
          border: (theme) =>
            `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: "primary.main",
            display: { xs: "none", md: "flex" },
          }}
        >
          <Person sx={{ fontSize: 18, color: "#fff" }} />
        </Avatar>
        <Typography
          sx={{
            color: "text.primary",
            fontSize: { xs: 11, md: 14 },
            fontWeight: 500,
          }}
        >
          {isSuperAdmin ? "Superuser" : "Administrator"} session active:{" "}
          <strong style={{ color: theme.palette.primary.main }}>
            {user?.email}
          </strong>
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          width: "100%",
        }}
      >
        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: (theme) =>
                alpha(theme.palette.background.default, 0.7),
              zIndex: 2,
            }}
          >
            <CircularProgress color="primary" />
          </Box>
        )}
        <TableContainer sx={{ maxWidth: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                {[
                  "No",
                  "Name",
                  "Contact",
                  "Property",
                  "Budget",
                  "Date",
                  "Key",
                  "Interior Designer",
                  "Actions",
                ].map((h) => (
                  <TableCell key={h} align={h === "Actions" ? "right" : "left"}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedHomeOwners.map((u, index) => (
                <TableRow
                  key={index}
                  sx={{
                    "&:hover": { background: "action.hover" },
                    transition: "background 0.2s",
                  }}
                >
                  <TableCell
                    sx={{
                      color: "text.primary",
                      fontWeight: 600,
                    }}
                  >
                    {index + 1}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "text.primary",
                      fontWeight: 600,
                    }}
                  >
                    {u.name}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", fontWeight: 500 }}
                    >
                      {u.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={u.propertyType}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.7rem",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ color: "success.main", fontWeight: 700 }}
                    >
                      ${u.renoBudget.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", fontSize: "0.85rem" }}
                    >
                      {u.renoDate}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {u.keyCollected ? (
                      <Chip
                        label="Collected"
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                      />
                    ) : (
                      <Chip
                        label="Pending"
                        size="small"
                        color="warning"
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: u.interiorDesignerId
                            ? "secondary.main"
                            : "action.disabledBackground",
                          fontSize: 12,
                        }}
                      >
                        {getDesignerName(u.interiorDesignerId).charAt(0)}
                      </Avatar>
                      <Typography
                        variant="body2"
                        sx={{
                          color: u.interiorDesignerId
                            ? "text.primary"
                            : "text.disabled",
                          fontWeight: 500,
                        }}
                      >
                        {getDesignerName(u.interiorDesignerId)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenEdit(u)}
                      sx={{
                        color: "text.secondary",
                        mr: 1,
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDelete(u.id)}
                      disabled={!isSuperAdmin}
                      sx={{
                        color: isSuperAdmin
                          ? "text.secondary"
                          : "action.disabled",
                        "&:hover": {
                          color: isSuperAdmin ? "error.main" : "inherit",
                        },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {emptyRows > 0 && homeOwners.length > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell
                    colSpan={8}
                    sx={{ borderColor: "rgba(255,255,255,0.05)" }}
                  />
                </TableRow>
              )}
              {!loading && filteredHomeOwners.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    align="center"
                    sx={{
                      py: 8,
                      borderColor: "rgba(255,255,255,0.05)",
                      color: "text.secondary",
                    }}
                  >
                    <Box sx={{ opacity: 0.2, mb: 2 }}>
                      <House sx={{ fontSize: 48 }} />
                    </Box>
                    {searchTerm
                      ? `No home owners found matching "${searchTerm}"`
                      : 'No Home Owners found. Click "Add New" to get started.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredHomeOwners.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        />
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
            pb: 2,
            fontWeight: 700,
          }}
        >
          {isEditMode ? "Edit Home Owner Details" : "Register New Home Owner"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
              }}
            >
              <TextField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                fullWidth
                error={formErrors.name}
                helperText={formErrors.name ? "Name is required" : ""}
                InputProps={{
                  startAdornment: (
                    <Person
                      sx={{ color: "text.disabled", mr: 1, fontSize: 20 }}
                    />
                  ),
                }}
              />
              <TextField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                fullWidth
                error={formErrors.phone}
                helperText={formErrors.phone ? "Phone is required" : ""}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Property Type</InputLabel>
                <Select
                  name="propertyType"
                  value={formData.propertyType}
                  label="Property Type"
                  onChange={handleFormChange}
                  startAdornment={
                    <House
                      sx={{ color: "text.disabled", mr: 1, fontSize: 20 }}
                    />
                  }
                >
                  {PROPERTY_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Renovation Budget"
                name="renoBudget"
                type="number"
                value={formData.renoBudget}
                onChange={handleFormChange}
                fullWidth
                error={formErrors.renoBudget}
                helperText={formErrors.renoBudget ? "Invalid budget" : ""}
                InputProps={{
                  startAdornment: (
                    <MonetizationOn
                      sx={{ color: "text.disabled", mr: 1, fontSize: 20 }}
                    />
                  ),
                }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
              }}
            >
              <TextField
                label="Target Renovation Date"
                name="renoDate"
                type="date"
                value={formData.renoDate}
                onChange={handleFormChange}
                fullWidth
                error={formErrors.renoDate}
                helperText={formErrors.renoDate ? "Date is required" : ""}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <CalendarToday
                      sx={{ color: "text.disabled", mr: 1, fontSize: 20 }}
                    />
                  ),
                }}
              />

              <FormControl fullWidth>
                <InputLabel>Assign Designer</InputLabel>
                <Select
                  name="interiorDesignerId"
                  value={formData.interiorDesignerId || ""}
                  label="Assign Designer"
                  onChange={handleFormChange}
                >
                  <MenuItem value="">
                    <em>None (Unassigned)</em>
                  </MenuItem>
                  {designers.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Paper
              sx={{
                p: 1.5,
                bgcolor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.keyCollected}
                    onChange={handleSwitchChange}
                    name="keyCollected"
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <VpnKey
                      sx={{
                        fontSize: 18,
                        color: formData.keyCollected
                          ? "success.main"
                          : "text.disabled",
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Key Already Collected?
                    </Typography>
                  </Box>
                }
              />
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{
              color: "text.secondary",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained">
            {isEditMode ? "Update Member" : "Register Owner"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Are you sure you want to permanently remove this home owner record?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setOpenDeleteConfirm(false)}
            sx={{ color: "text.secondary", textTransform: "none" }}
          >
            Keep Record
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
            }}
          >
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <SuccessModal
        open={successModal.open}
        onClose={() => setSuccessModal((prev) => ({ ...prev, open: false }))}
        title={successModal.title}
        message={successModal.message}
      />
    </MainLayout>
  );
}
