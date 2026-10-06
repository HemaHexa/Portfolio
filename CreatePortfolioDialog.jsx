import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import {
  activatePortfolio,
  addHolding,
  createPortfolio,
  getBenchmarks,
  getReferenceSecurities,
  getThemes,
} from "../api/api";

const emptyPortfolio = {
  portfolio_name: "",
  portfolio_type: "",
  exchange: "",
  theme_id: "",
  rebalancing_frequency: "",
  amount: 0,
};

function CreatePortfolioDialog({
  open,
  onClose,
  onCreated,
}) {
  const [tab, setTab] = useState(0);

  const [form, setForm] = useState(emptyPortfolio);
  const [themes, setThemes] = useState([]);
  const [benchmarks, setBenchmarks] = useState([]);

  const [securityRows, setSecurityRows] = useState([]);
  const [securityTotal, setSecurityTotal] = useState(0);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });

  const [selectedHoldings, setSelectedHoldings] = useState([]);
  const [quantityMap, setQuantityMap] = useState({});

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    async function loadReferenceData() {
      try {
        const [themeData, benchmarkData] = await Promise.all([
          getThemes(),
          getBenchmarks(),
        ]);

        setThemes(
          themeData.filter(
            (theme) => theme.status === "ACTIVE"
          )
        );

        setBenchmarks(benchmarkData);
      } catch (err) {
        console.error(err);
        setError("Unable to load reference data");
      }
    }

    loadReferenceData();
  }, [open]);

  useEffect(() => {
    if (open) {
      setTab(0);
      setForm(emptyPortfolio);
      setSelectedHoldings([]);
      setQuantityMap({});
      setSearch("");
      setError("");
      setPaginationModel({
        page: 0,
        pageSize: 25,
      });
    }
  }, [open]);

  async function loadSecurities() {
    if (!form.exchange) {
      setSecurityRows([]);
      setSecurityTotal(0);
      return;
    }

    try {
      setSecurityLoading(true);

      const data = await getReferenceSecurities({
        exchange: form.exchange,
        search,
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      });

      setSecurityRows(data.rows);
      setSecurityTotal(data.total);
    } catch (err) {
      console.error(err);
      setError("Unable to load securities");
    } finally {
      setSecurityLoading(false);
    }
  }

  useEffect(() => {
    if (tab === 1 && form.exchange) {
      loadSecurities();
    }
  }, [
    tab,
    form.exchange,
    paginationModel.page,
    paginationModel.pageSize,
  ]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  const currency = useMemo(() => {
    if (form.exchange === "NSE") {
      return "INR";
    }

    if (form.exchange === "NASDAQ") {
      return "USD";
    }

    if (form.exchange === "LSE") {
      return "GBP";
    }

    return "-";
  }, [form.exchange]);

  const benchmarkName = useMemo(() => {
    const benchmark = benchmarks.find(
      (item) => item.exchange === form.exchange
    );

    return benchmark
      ? benchmark.benchmark_name
      : "-";
  }, [benchmarks, form.exchange]);

  function handleNext() {
    if (form.portfolio_name.trim() === "") {
      setError("Portfolio Name is required");
      return;
    }

    if (!form.exchange) {
      setError("Exchange is required");
      return;
    }

    if (!form.theme_id) {
      setError("Investment Theme is required");
      return;
    }

    setError("");
    setTab(1);
  }

  function handleQuantityChange(
    securityId,
    value
  ) {
    setQuantityMap((previous) => ({
      ...previous,
      [securityId]: value,
    }));
  }

  function handleAddSecurity(security) {
    const quantity = Number(
      quantityMap[security.security_id]
    );

    if (!quantity || quantity <= 0) {
      setError(
        "Enter a valid quantity before adding the security"
      );
      return;
    }

    const alreadyAdded = selectedHoldings.some(
      (item) =>
        item.security_id === security.security_id
    );

    if (alreadyAdded) {
      setError("Security already added");
      return;
    }

    setSelectedHoldings((previous) => [
      ...previous,
      {
        ...security,
        quantity,
      },
    ]);

    setError("");
  }

  function removeSelectedHolding(
    securityId
  ) {
    setSelectedHoldings((previous) =>
      previous.filter(
        (item) =>
          item.security_id !== securityId
      )
    );
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError("");

      const created = await createPortfolio({
        portfolio_name: form.portfolio_name,
        portfolio_type:
          form.portfolio_type || null,
        exchange: form.exchange,
        theme_id: Number(form.theme_id),
        rebalancing_frequency:
          form.rebalancing_frequency || null,
        amount: Number(form.amount || 0),
      });

      const portfolioId =
        created.portfolio_id;

      if (selectedHoldings.length > 0) {
        await activatePortfolio(portfolioId);

        for (const holding of selectedHoldings) {
          await addHolding(
            portfolioId,
            {
              security_id:
                holding.security_id,
              quantity:
                Number(holding.quantity),
            }
          );
        }
      }

      if (onCreated) {
        await onCreated();
      }

      onClose();
    } catch (err) {
      console.error(
        "Portfolio creation error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to create portfolio"
      );
    } finally {
      setSaving(false);
    }
  }

  const securityColumns = [
    {
      field: "symbol",
      headerName: "Symbol",
      width: 140,
    },
    {
      field: "security_name",
      headerName: "Security Name",
      width: 260,
    },
    {
      field: "asset_class",
      headerName: "Asset Class",
      width: 170,
    },
    {
      field: "sector",
      headerName: "Sector",
      width: 190,
    },
    {
      field: "currency",
      headerName: "Currency",
      width: 100,
    },
    {
      field: "quantity",
      headerName: "Quantity",
      width: 140,
      sortable: false,

      renderCell: (params) => (
        <TextField
          size="small"
          type="number"
          value={
            quantityMap[
              params.row.security_id
            ] || ""
          }
          onChange={(event) =>
            handleQuantityChange(
              params.row.security_id,
              event.target.value
            )
          }
          inputProps={{
            min: 0.0001,
          }}
        />
      ),
    },
    {
      field: "action",
      headerName: "Action",
      width: 110,
      sortable: false,
      filterable: false,

      renderCell: (params) => (
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() =>
            handleAddSecurity(params.row)
          }
        >
          Add
        </Button>
      ),
    },
  ];

  const selectedColumns = [
    {
      field: "symbol",
      headerName: "Symbol",
      width: 150,
    },
    {
      field: "security_name",
      headerName: "Security Name",
      flex: 1,
    },
    {
      field: "asset_class",
      headerName: "Asset Class",
      width: 170,
    },
    {
      field: "quantity",
      headerName: "Quantity",
      width: 120,
    },
    {
      field: "remove",
      headerName: "",
      width: 80,

      renderCell: (params) => (
        <IconButton
          onClick={() =>
            removeSelectedHolding(
              params.row.security_id
            )
          }
        >
          <DeleteOutlineIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={
        saving
          ? undefined
          : onClose
      }
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle>
        Create Portfolio
      </DialogTitle>

      <Tabs
        value={tab}
        onChange={(
          event,
          newValue
        ) => {
          if (newValue === 1) {
            handleNext();
          } else {
            setTab(0);
          }
        }}
      >
        <Tab label="Add" />
        <Tab label="Holdings" />
      </Tabs>

      <DialogContent>
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
            }}
          >
            {error}
          </Alert>
        )}

        {tab === 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 2,
              mt: 1,
            }}
          >
            <TextField
              label="Portfolio Name"
              name="portfolio_name"
              value={form.portfolio_name}
              onChange={handleChange}
              required
            />

            <TextField
              label="Portfolio Type"
              name="portfolio_type"
              value={form.portfolio_type}
              onChange={handleChange}
            />

            <TextField
              select
              label="Exchange"
              name="exchange"
              value={form.exchange}
              onChange={handleChange}
              required
            >
              <MenuItem value="NSE">
                NSE
              </MenuItem>

              <MenuItem value="NASDAQ">
                NASDAQ
              </MenuItem>

              <MenuItem value="LSE">
                LSE
              </MenuItem>
            </TextField>

            <TextField
              select
              label="Investment Theme"
              name="theme_id"
              value={form.theme_id}
              onChange={handleChange}
              required
            >
              {themes.map((theme) => (
                <MenuItem
                  key={theme.theme_id}
                  value={theme.theme_id}
                >
                  {theme.theme_name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Currency"
              value={currency}
              InputProps={{
                readOnly: true,
              }}
            />

            <TextField
              label="Benchmark"
              value={benchmarkName}
              InputProps={{
                readOnly: true,
              }}
            />

            <TextField
              select
              label="Rebalancing Frequency"
              name="rebalancing_frequency"
              value={
                form.rebalancing_frequency
              }
              onChange={handleChange}
            >
              <MenuItem value="Monthly">
                Monthly
              </MenuItem>

              <MenuItem value="Quarterly">
                Quarterly
              </MenuItem>

              <MenuItem value="Half-Yearly">
                Half-Yearly
              </MenuItem>

              <MenuItem value="Yearly">
                Yearly
              </MenuItem>
            </TextField>

            <TextField
              type="number"
              label="Amount"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              inputProps={{
                min: 0,
              }}
            />
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ mt: 1 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
              }}
            >
              Add Securities
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns:
                  "1fr auto",
                gap: 2,
                mb: 2,
              }}
            >
              <TextField
                size="small"
                label="Search securities"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter"
                  ) {
                    setPaginationModel(
                      (previous) => ({
                        ...previous,
                        page: 0,
                      })
                    );

                    loadSecurities();
                  }
                }}
              />

              <Button
                variant="outlined"
                onClick={loadSecurities}
              >
                Search
              </Button>
            </Box>

            <Typography
              sx={{
                mb: 1,
              }}
            >
              Showing securities for:{" "}
              <strong>
                {form.exchange}
              </strong>
            </Typography>

            <Box
              sx={{
                height: 340,
                width: "100%",
              }}
            >
              <DataGrid
                rows={securityRows}
                columns={securityColumns}
                getRowId={(row) =>
                  row.security_id
                }
                loading={securityLoading}
                paginationMode="server"
                rowCount={securityTotal}
                paginationModel={
                  paginationModel
                }
                onPaginationModelChange={
                  setPaginationModel
                }
                pageSizeOptions={[
                  10,
                  25,
                  50,
                ]}
                disableRowSelectionOnClick
              />
            </Box>

            <Typography
              variant="h6"
              sx={{
                mt: 3,
                mb: 1,
              }}
            >
              Selected Holdings{" "}
              ({selectedHoldings.length})
            </Typography>

            <Box
              sx={{
                height: 220,
                width: "100%",
              }}
            >
              <DataGrid
                rows={selectedHoldings}
                columns={selectedColumns}
                getRowId={(row) =>
                  row.security_id
                }
                hideFooter
                disableRowSelectionOnClick
              />
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </Button>

        {tab === 0 ? (
          <Button
            variant="contained"
            onClick={handleNext}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default CreatePortfolioDialog;
