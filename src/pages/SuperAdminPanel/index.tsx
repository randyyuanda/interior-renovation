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
  Email,
  Shield,
  LockOutlined,
  Search,
} from "@mui/icons-material";
import { useAuth } from "../../store/authStore";
import MainLayout from "../../components/MainLayout";
import { useEffect, useState } from "react";
import {
  getUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  type UserPayload,
} from "../../api/userApi";
import type { User } from "../../models/auth";
import SuccessModal from "../../components/SuccessModal";

export default function SuperAdminPanel() {
  const { user: currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const isSuperAdmin = currentUser?.role === "superadmin";

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState<UserPayload>({
    email: "",
    password: "",
    role: "admin",
  });

  const [formErrors, setFormErrors] = useState({
    email: false,
    password: false,
  });

  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

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

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsersApi();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Failed to load users from management server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
    setFormData({ email: "", password: "", role: "admin" });
    setFormErrors({ email: false, password: false });
    setOpenDialog(true);
  };

  const handleOpenEdit = (userToEdit: User) => {
    setIsEditMode(true);
    setCurrentId(userToEdit.id);
    setFormData({
      email: userToEdit.email,
      password: "",
      role: userToEdit.role,
    });
    setFormErrors({ email: false, password: false });
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
    setFormData((prev) => ({ ...prev, [name as string]: value }));
    if (typeof value === "string" && value.trim() !== "") {
      setFormErrors((prev) => ({ ...prev, [name as string]: false }));
    }
  };

  const handleSave = async () => {
    const errors = {
      email: formData.email.trim() === "",
      password: !isEditMode && formData.password?.trim() === "",
    };

    if (errors.email || errors.password) {
      setFormErrors(errors);
      return;
    }

    try {
      if (isEditMode && currentId !== null) {
        const payload: Partial<UserPayload> = {
          email: formData.email,
          role: formData.role,
        };
        if (formData.password) payload.password = formData.password;

        await updateUserApi(currentId, payload);
        setSuccessModal({
          open: true,
          title: "Account Updated",
          message: "User credentials and permissions have been updated.",
        });
      } else {
        await createUserApi(formData);
        setSuccessModal({
          open: true,
          title: "Account Created",
          message: "A new administrator account has been successfully created.",
        });
      }
      fetchUsers();
      handleCloseDialog();
    } catch (err) {
      console.error("Failed to save user:", err);
      setSnackbar({
        open: true,
        message: "Failed to save user details",
        severity: "error",
      });
    }
  };

  const handleOpenDelete = (id: number) => {
    const userToDel = users.find((u) => u.id === id);
    if (userToDel?.role === "superadmin") {
      const superAdminCount = users.filter(
        (u) => u.role === "superadmin",
      ).length;
      if (superAdminCount <= 1) {
        setSnackbar({
          open: true,
          message: "Cannot delete the last super admin",
          severity: "error",
        });
        return;
      }
    }
    setUserToDelete(id);
    setOpenDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete !== null) {
      try {
        await deleteUserApi(userToDelete);
        setSnackbar({
          open: true,
          message: "User deleted successfully",
          severity: "success",
        });
        fetchUsers();
        const newTotalCount = users.length - 1;
        if (page > 0 && page * rowsPerPage >= newTotalCount) {
          setPage(page - 1);
        }
      } catch (err) {
        console.error("Failed to delete user:", err);
        setSnackbar({
          open: true,
          message: "Failed to delete user",
          severity: "error",
        });
      }
    }
    setOpenDeleteConfirm(false);
    setUserToDelete(null);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredUsers.length) : 0;
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <MainLayout
      title="System Administration"
      icon={<ManageAccounts sx={{ fontSize: 32 }} />}
      subtitle="Super Admin User Management"
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
            User Accounts
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip
              label="SUPERADMIN CONTROL"
              color="error"
              size="small"
              sx={{ fontWeight: 800, borderRadius: "4px" }}
            />
            <Chip
              label={`${users.length} Total`}
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
            placeholder="Search accounts..."
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
          <Shield sx={{ fontSize: 18, color: "#fff" }} />
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
            {currentUser?.email}
          </strong>
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ borderRadius: 4, overflow: "hidden", width: "100%" }}>
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
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                {[
                  "No",
                  "Profile",
                  "Email Address",
                  "Privileges",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <TableCell key={h} align={h === "Actions" ? "right" : "left"}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((u, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        background:
                          u.role === "superadmin"
                            ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                            : "action.selected",
                        boxShadow:
                          u.role === "superadmin"
                            ? `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`
                            : "none",
                      }}
                    >
                      <Person
                        sx={{
                          fontSize: 20,
                          color: u.role === "superadmin" ? "#fff" : "inherit",
                        }}
                      />
                    </Avatar>
                  </TableCell>
                  <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={u.role.toUpperCase()}
                      color={u.role === "superadmin" ? "error" : "info"}
                      variant="outlined"
                      size="small"
                      sx={{ fontWeight: 800, borderRadius: "6px" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "success.main",
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: "success.main", fontWeight: 700 }}
                      >
                        Active
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
                      disabled={u.id === currentUser?.id}
                      sx={{
                        color: "text.secondary",
                        "&:hover": { color: "error.main" },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {emptyRows > 0 && filteredUsers.length > 0 && (
                <TableRow style={{ height: 71 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
              {filteredUsers.length === 0 && !loading && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ py: 4, color: "text.secondary" }}
                  >
                    {searchTerm
                      ? `No accounts found matching "${searchTerm}"`
                      : "No administrator accounts found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {isEditMode ? "Edit User Credentials" : "Register New Administrator"}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}
          >
            <TextField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFormChange}
              fullWidth
              error={formErrors.email}
              helperText={formErrors.email ? "Email is required" : ""}
              InputProps={{
                startAdornment: (
                  <Email sx={{ color: "text.disabled", mr: 1, fontSize: 20 }} />
                ),
              }}
            />
            <TextField
              label={
                isEditMode ? "New Password (Optional)" : "Default Password"
              }
              name="password"
              type="password"
              value={formData.password}
              onChange={handleFormChange}
              fullWidth
              error={formErrors.password}
              helperText={formErrors.password ? "Password is required" : ""}
              InputProps={{
                startAdornment: (
                  <LockOutlined
                    sx={{ color: "text.disabled", mr: 1, fontSize: 20 }}
                  />
                ),
              }}
            />
            <FormControl fullWidth>
              <InputLabel>System Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                label="System Role"
                onChange={handleFormChange}
                startAdornment={
                  <Shield
                    sx={{ color: "text.disabled", mr: 1, fontSize: 20 }}
                  />
                }
              >
                <MenuItem value="admin">Standard Admin</MenuItem>
                <MenuItem value="superadmin">Super Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{ color: "text.secondary", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" sx={{ px: 4 }}>
            {isEditMode ? "Update User" : "Create Account"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Revoke Access</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "text.secondary" }}>
            Are you sure you want to permanently delete this administrator
            account? They will lose all access to the system immediately.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setOpenDeleteConfirm(false)}
            sx={{ color: "text.secondary" }}
          >
            Keep Account
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
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
