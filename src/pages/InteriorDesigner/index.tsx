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
  useTheme,
  alpha,
  useMediaQuery,
} from "@mui/material";
import {
  ManageAccounts,
  Person,
  Add,
  Edit,
  Delete,
  Search,
} from "@mui/icons-material";
import { useAuth } from "../../store/authStore";
import MainLayout from "../../components/MainLayout";
import { useEffect, useState } from "react";
import {
  getInteriorDesignersApi,
  createInteriorDesignerApi,
  updateInteriorDesignerApi,
  deleteInteriorDesignerApi,
} from "../../api/interiorDesignerApi";
import type { InteriorDesigner } from "../../models/interiorDesigner";
import SuccessModal from "../../components/SuccessModal";

export default function InteriorDesignerPage() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [designers, setDesigners] = useState<InteriorDesigner[]>([]);
  const isSuperAdmin = user?.role === "superadmin";

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [formErrors, setFormErrors] = useState({ name: false, phone: false });
  const [searchTerm, setSearchTerm] = useState("");

  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [designerToDelete, setDesignerToDelete] = useState<number | null>(null);

  const [successModal, setSuccessModal] = useState({
    open: false,
    title: "",
    message: "",
  });

  const fetchDesigners = () => {
    getInteriorDesignersApi()
      .then((data) => setDesigners(data))
      .catch((err) => console.error("Failed to load interior designers:", err));
  };

  useEffect(() => {
    fetchDesigners();
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
    setFormData({ name: "", phone: "" });
    setFormErrors({ name: false, phone: false });
    setOpenDialog(true);
  };

  const handleOpenEdit = (designer: InteriorDesigner) => {
    setIsEditMode(true);
    setCurrentId(designer.id);
    setFormData({ name: designer.name, phone: designer.phone });
    setFormErrors({ name: false, phone: false });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (value.trim() !== "") {
      setFormErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleSave = async () => {
    const isNameEmpty = formData.name.trim() === "";
    const isPhoneEmpty = formData.phone.trim() === "";

    if (isNameEmpty || isPhoneEmpty) {
      setFormErrors({ name: isNameEmpty, phone: isPhoneEmpty });
      return;
    }

    try {
      if (isEditMode && currentId !== null) {
        await updateInteriorDesignerApi(currentId, formData);
        setSuccessModal({
          open: true,
          title: "Update Successful",
          message: "Interior designer information has been updated.",
        });
      } else {
        await createInteriorDesignerApi(formData);
        setSuccessModal({
          open: true,
          title: "Creation Successful",
          message: "A new interior designer has been successfully registered.",
        });
      }
      fetchDesigners();
      handleCloseDialog();
    } catch (err) {
      console.error("Failed to save interior designer:", err);
    }
  };

  const handleOpenDelete = (id: number) => {
    setDesignerToDelete(id);
    setOpenDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (designerToDelete !== null) {
      try {
        await deleteInteriorDesignerApi(designerToDelete);
        fetchDesigners();
        const newTotalCount = designers.length - 1;
        if (page > 0 && page * rowsPerPage >= newTotalCount) {
          setPage(page - 1);
        }
      } catch (err) {
        console.error("Failed to delete interior designer:", err);
      }
    }
    setOpenDeleteConfirm(false);
    setDesignerToDelete(null);
  };

  const filteredDesigners = designers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phone.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - filteredDesigners.length)
      : 0;
  const paginatedDesigners = filteredDesigners.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <MainLayout
      title="Interior Designer"
      icon={<ManageAccounts sx={{ fontSize: 32 }} />}
      subtitle="Manage Interior Designers"
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
            Interior Designer
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip
              label={isSuperAdmin ? "SUPERADMIN ACCESS" : "ADMIN ACCESS"}
              color={isSuperAdmin ? "error" : "info"}
              size="small"
              sx={{ fontWeight: 800, borderRadius: "4px" }}
            />
            <Chip
              label={`${designers.length} Total`}
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
            placeholder="Search designers..."
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

      {/* Logged-in info banner */}
      <Paper
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: { xs: 3, md: 4 },
          borderRadius: 3,
          background: alpha(theme.palette.primary.main, 0.1),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
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

      {/* Users Table */}
      <Paper
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          width: "100%",
        }}
      >
        <TableContainer sx={{ maxWidth: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                {["No", "Name", "Phone", "Actions"].map((h) => (
                  <TableCell key={h} align={h === "Actions" ? "right" : "left"}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedDesigners.map((u) => (
                <TableRow
                  key={u.id}
                  sx={{
                    "&:hover": { background: "action.hover" },
                    transition: "background 0.2s",
                  }}
                >
                  <TableCell
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    {u.id}
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "success.main",
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: "success.main", fontWeight: 700 }}
                      >
                        {u.phone}
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
                      sx={{
                        color: "text.secondary",
                        "&:hover": { color: "error.main" },
                      }}
                      disabled={!isSuperAdmin}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {emptyRows > 0 && designers.length > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={4} />
                </TableRow>
              )}
              {filteredDesigners.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="center"
                    sx={{ py: 4, color: "text.secondary" }}
                  >
                    {searchTerm
                      ? `No designers found matching "${searchTerm}"`
                      : "No interior designers found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredDesigners.length}
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

      {/* Create / Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 3 },
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
          {isEditMode ? "Edit Interior Designer" : "Add Interior Designer"}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}
          >
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              fullWidth
              error={formErrors.name}
              helperText={formErrors.name ? "Name is required" : ""}
            />
            <TextField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              fullWidth
              error={formErrors.phone}
              helperText={formErrors.phone ? "Phone is required" : ""}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleCloseDialog} sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained">
            {isEditMode ? "Save Changes" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Are you sure you want to delete this interior designer?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setOpenDeleteConfirm(false)}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <SuccessModal
        open={successModal.open}
        onClose={() => setSuccessModal((prev) => ({ ...prev, open: false }))}
        title={successModal.title}
        message={successModal.message}
      />
    </MainLayout>
  );
}
