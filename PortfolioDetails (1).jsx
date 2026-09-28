import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../api/api";
import { useAlertToast } from "../context/AlertToastContext";

import "../styles/common.css";


function PortfolioDetails() {

  const { portfolioId } = useParams();

  const { showAlertToast } = useAlertToast();

  const [activeTab, setActiveTab] = useState("overview");

  const [portfolio, setPortfolio] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [allocation, setAllocation] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [rebalancing, setRebalancing] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [assetClasses, setAssetClasses] = useState([]);

  const [securities, setSecurities] = useState([]);
  const [selectedSecurity, setSelectedSecurity] = useState(null);
  const [pricePreview, setPricePreview] = useState(null);

  const [suggestions, setSuggestions] = useState(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [buyForm, setBuyForm] = useState({
    asset_class_id: "",
    search: "",
    security_id: "",
    transaction_date: "",
    value: ""
  });

  const [sellForm, setSellForm] = useState({
    security_id: "",
    symbol: "",
    quantity_owned: 0,
    transaction_date: "",
    quantity: ""
  });


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadInitialData();

  }, [portfolioId]);


  // Refresh tab-specific data whenever user opens a tab.
  useEffect(() => {

    if (activeTab === "allocation") {
      loadAllocation();
    }

    if (activeTab === "alerts") {
      loadAlerts();
    }

    if (activeTab === "rebalancing") {
      loadRebalancing();
    }

    if (activeTab === "performance") {
      loadPerformance();
    }

    if (activeTab === "holdings") {
      loadHoldings();
    }

    if (activeTab === "transactions") {
      loadTransactions();
    }

  }, [activeTab]);


  async function loadInitialData() {

    try {

      setLoading(true);

      await Promise.all([
        loadPortfolio(),
        loadHoldings(),
        loadTransactions(),
        loadAllocation(),
        loadAlerts(),
        loadRebalancing(),
        loadPerformance(),
        loadAssetClasses()
      ]);

    }
    finally {

      setLoading(false);

    }

  }


  // =====================================================
  // LOAD PORTFOLIO
  // =====================================================

  async function loadPortfolio() {

    try {

      const response = await api.get(
        `/api/portfolios/${portfolioId}`
      );

      setPortfolio(response.data);

    }
    catch (error) {

      console.log("PORTFOLIO ERROR:", error.response?.data || error);

      setMessage(
        error.response?.data?.detail
        || "Unable to load portfolio"
      );

    }

  }


  // =====================================================
  // LOAD HOLDINGS
  // =====================================================

  async function loadHoldings() {

    try {

      const response = await api.get(
        `/api/portfolios/${portfolioId}/holdings`
      );

      setHoldings(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    }
    catch (error) {

      console.log("HOLDINGS ERROR:", error.response?.data || error);

      setHoldings([]);

    }

  }


  // =====================================================
  // LOAD TRANSACTIONS
  // =====================================================

  async function loadTransactions() {

    try {

      const response = await api.get(
        `/api/portfolios/${portfolioId}/transactions`
      );

      setTransactions(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    }
    catch (error) {

      console.log("TRANSACTIONS ERROR:", error.response?.data || error);

      setTransactions([]);

    }

  }


  // =====================================================
  // LOAD ALLOCATION
  // =====================================================

  async function loadAllocation() {

    try {

      const response = await api.get(
        `/api/portfolios/${portfolioId}/allocation`
      );

      setAllocation(response.data);

    }
    catch (error) {

      console.log("ALLOCATION ERROR:", error.response?.data || error);

      setAllocation(null);

    }

  }


  // =====================================================
  // LOAD ALERTS
  // =====================================================

  async function loadAlerts() {

    try {

      const response = await api.get(
        `/api/portfolios/${portfolioId}/alerts`
      );

      setAlerts(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    }
    catch (error) {

      console.log("ALERTS ERROR:", error.response?.data || error);

      setAlerts([]);

    }

  }


  // =====================================================
  // LOAD REBALANCING
  // =====================================================

  async function loadRebalancing() {

    try {

      const response = await api.get(
        `/api/portfolios/${portfolioId}/rebalancing`
      );

      console.log("REBALANCING RESPONSE:", response.data);

      setRebalancing(response.data);

    }
    catch (error) {

      console.log(
        "REBALANCING ERROR:",
        error.response?.data || error
      );

      setRebalancing(null);

    }

  }


  // =====================================================
  // LOAD PERFORMANCE
  // =====================================================

  async function loadPerformance() {

    try {

      const response = await api.get(
        `/api/portfolios/${portfolioId}/performance`
      );

      console.log("PERFORMANCE RESPONSE:", response.data);

      setPerformance(response.data);

    }
    catch (error) {

      console.log(
        "PERFORMANCE ERROR:",
        error.response?.data || error
      );

      setPerformance(null);

    }

  }


  // =====================================================
  // LOAD ASSET CLASSES
  // =====================================================

  async function loadAssetClasses() {

    try {

      const response = await api.get(
        "/api/asset-classes"
      );

      let list = [];

      if (Array.isArray(response.data)) {
        list = response.data;
      }
      else if (Array.isArray(response.data?.asset_classes)) {
        list = response.data.asset_classes;
      }
      else if (Array.isArray(response.data?.data)) {
        list = response.data.data;
      }

      const searchable = list.filter(
        item =>
          item.status === "ACTIVE"
          &&
          item.asset_class_name !== "Cash"
      );

      setAssetClasses(searchable);

    }
    catch (error) {

      console.log(
        "ASSET CLASS ERROR:",
        error.response?.data || error
      );

      setAssetClasses([]);

    }

  }


  // =====================================================
  // SEARCH SECURITIES
  // =====================================================

  useEffect(() => {

    if (
      !buyForm.asset_class_id
      ||
      !buyForm.search.trim()
    ) {

      setSecurities([]);
      return;

    }

    const timer = setTimeout(() => {
      searchSecurities();
    }, 300);

    return () => clearTimeout(timer);

  }, [
    buyForm.asset_class_id,
    buyForm.search
  ]);


  async function searchSecurities() {

    try {

      const response = await api.get(
        "/api/securities/search",
        {
          params: {
            asset_class_id: buyForm.asset_class_id,
            query: buyForm.search
          }
        }
      );

      setSecurities(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    }
    catch (error) {

      console.log(
        "SECURITY SEARCH ERROR:",
        error.response?.data || error
      );

      setSecurities([]);

    }

  }


  function chooseSecurity(security) {

    setSelectedSecurity(security);

    setBuyForm(previous => ({
      ...previous,
      security_id: security.security_id,
      search: security.symbol
    }));

    setSecurities([]);
    setPricePreview(null);

  }


  // =====================================================
  // HISTORICAL PRICE PREVIEW
  // =====================================================

  useEffect(() => {

    if (
      !buyForm.security_id
      ||
      !buyForm.transaction_date
    ) {

      setPricePreview(null);
      return;

    }

    loadHistoricalPrice();

  }, [
    buyForm.security_id,
    buyForm.transaction_date
  ]);


  async function loadHistoricalPrice() {

    try {

      const response = await api.get(
        `/api/securities/${buyForm.security_id}/price`,
        {
          params: {
            transaction_date: buyForm.transaction_date
          }
        }
      );

      setPricePreview(response.data);

    }
    catch (error) {

      console.log(
        "PRICE PREVIEW ERROR:",
        error.response?.data || error
      );

      setPricePreview(null);

    }

  }


  // =====================================================
  // BUY
  // =====================================================

  async function buySecurity(event) {

    event.preventDefault();

    if (
      !buyForm.security_id
      ||
      !buyForm.transaction_date
      ||
      Number(buyForm.value) <= 0
    ) {

      setMessage("Enter all BUY details");
      return;

    }

    try {

      const response = await api.post(
        `/api/portfolios/${portfolioId}/buy`,
        {
          security_id: Number(buyForm.security_id),
          transaction_date: buyForm.transaction_date,
          value: Number(buyForm.value)
        }
      );

      setMessage("Security purchased successfully");

      showAutomaticAlerts(
        response.data?.automatic_alerts
      );

      setBuyForm({
        asset_class_id: "",
        search: "",
        security_id: "",
        transaction_date: "",
        value: ""
      });

      setSelectedSecurity(null);
      setPricePreview(null);

      await refreshPortfolioData();

    }
    catch (error) {

      console.log("BUY ERROR:", error.response?.data || error);

      setMessage(
        error.response?.data?.detail
        || "Unable to complete BUY"
      );

    }

  }


  // =====================================================
  // TOAST ALERTS
  // =====================================================

  function showAutomaticAlerts(alertResult) {

    const list = alertResult?.alerts;

    if (!Array.isArray(list)) {
      return;
    }

    list.forEach(alert => {

      showAlertToast({
        title: "Allocation Alert",
        message: alert.alert_message,
        action: alert.recommendation_action,
        amount: alert.recommendation_amount,
        portfolioId: portfolioId,
        alertId: alert.alert_id
      });

    });

  }


  // =====================================================
  // SELL
  // =====================================================

  function startSell(holding) {

    setSellForm({
      security_id: holding.security_id,
      symbol: holding.symbol,
      quantity_owned: Number(holding.quantity),
      transaction_date: "",
      quantity: ""
    });

    setActiveTab("holdings");

  }


  async function sellSecurity(event) {

    event.preventDefault();

    if (
      !sellForm.transaction_date
      ||
      Number(sellForm.quantity) <= 0
    ) {

      setMessage(
        "Enter SELL date and quantity"
      );

      return;

    }

    try {

      const response = await api.post(
        `/api/portfolios/${portfolioId}/sell`,
        {
          security_id: Number(sellForm.security_id),
          transaction_date: sellForm.transaction_date,
          quantity: Number(sellForm.quantity)
        }
      );

      setMessage(
        `Sold ${response.data.quantity_sold} ${response.data.symbol} successfully`
      );

      showAutomaticAlerts(
        response.data?.automatic_alerts
      );

      setSellForm({
        security_id: "",
        symbol: "",
        quantity_owned: 0,
        transaction_date: "",
        quantity: ""
      });

      await refreshPortfolioData();

    }
    catch (error) {

      console.log("SELL ERROR:", error.response?.data || error);

      setMessage(
        error.response?.data?.detail
        || "Unable to complete SELL"
      );

    }

  }


  // =====================================================
  // ALERT ACTIONS
  // =====================================================

  async function markAlertRead(alertId) {

    try {

      await api.put(
        `/api/alerts/${alertId}/read`
      );

      await loadAlerts();

    }
    catch (error) {

      console.log(
        "MARK ALERT READ ERROR:",
        error.response?.data || error
      );

    }

  }


  // =====================================================
  // REBALANCING SUGGESTIONS
  // =====================================================

  async function loadSuggestions(assetClassId) {

    try {

      const response = await api.get(
        `/api/portfolios/${portfolioId}/rebalancing/${assetClassId}/suggestions`
      );

      setSuggestions(response.data);

    }
    catch (error) {

      console.log(
        "SUGGESTION ERROR:",
        error.response?.data || error
      );

      setMessage(
        error.response?.data?.detail
        || "Unable to load suggestions"
      );

    }

  }


  function useBuySuggestion(item) {

    setBuyForm({
      asset_class_id: suggestions?.asset_class_id || "",
      search: item.symbol,
      security_id: item.security_id,
      transaction_date: "",
      value: suggestions?.recommended_amount || ""
    });

    setSelectedSecurity(item);

    setSuggestions(null);
    setActiveTab("buy");

  }


  function useSellSuggestion(item) {

    setSellForm({
      security_id: item.security_id,
      symbol: item.symbol,
      quantity_owned: Number(item.quantity_owned || 0),
      transaction_date: "",
      quantity: item.suggested_quantity_to_sell || ""
    });

    setSuggestions(null);
    setActiveTab("holdings");

  }


  // =====================================================
  // REFRESH
  // =====================================================

  async function refreshPortfolioData() {

    await Promise.all([
      loadPortfolio(),
      loadHoldings(),
      loadTransactions(),
      loadAllocation(),
      loadAlerts(),
      loadRebalancing(),
      loadPerformance()
    ]);

  }


  // =====================================================
  // HELPERS
  // =====================================================

  function money(value) {

    return Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );

  }


  function recommendationClass(action) {

    if (action === "INCREASE") {
      return "recommend-increase";
    }

    if (action === "REDUCE") {
      return "recommend-reduce";
    }

    return "recommend-hold";

  }


  if (loading || !portfolio) {

    return (
      <p className="small-muted">
        Loading portfolio...
      </p>
    );

  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <div>

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="portfolio-detail-header">

        <div>

          <div className="portfolio-title-row">

            <h1>
              {portfolio.portfolio_name}
            </h1>

            <span
              className={
                portfolio.status === "Active"
                  ? "status-badge active-status"
                  : portfolio.status === "Closed"
                    ? "status-badge inactive-status"
                    : "status-badge new-status"
              }
            >
              {portfolio.status}
            </span>

          </div>

          <p>
            {portfolio.theme_name}
            {" • "}
            {portfolio.portfolio_type}
            {" • "}
            {portfolio.benchmark_name}
          </p>

        </div>

        <button
          className="secondary-button"
          onClick={refreshPortfolioData}
        >
          Refresh
        </button>

      </div>


      {/* =================================================
          MESSAGE
      ================================================= */}

      {
        message
        &&
        (
          <div className="asset-message">
            {message}
          </div>
        )
      }


      {/* =================================================
          TABS
      ================================================= */}

      <div className="portfolio-tabs">

        {
          [
            ["overview", "Overview"],
            ["buy", "Search & Buy"],
            ["holdings", "Holdings"],
            ["transactions", "Transactions"],
            ["allocation", "Asset Allocation"],
            ["alerts", "Alerts"],
            ["rebalancing", "Rebalancing"],
            ["performance", "Performance"]
          ].map(([key, label]) => (

            <button
              key={key}
              className={
                activeTab === key
                  ? "portfolio-tab active-tab"
                  : "portfolio-tab"
              }
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>

          ))
        }

      </div>


      {/* =================================================
          OVERVIEW
      ================================================= */}

      {
        activeTab === "overview"
        &&
        (
          <div className="overview-grid">

            <div className="glass-card">
              <div className="card-label">
                Initial Investment
              </div>
              <div className="card-value">
                ₹{money(portfolio.initial_investment)}
              </div>
            </div>

            <div className="glass-card">
              <div className="card-label">
                Available Cash
              </div>
              <div className="card-value">
                ₹{money(portfolio.available_balance)}
              </div>
            </div>

            <div className="glass-card">
              <div className="card-label">
                Current Portfolio Value
              </div>
              <div className="card-value">
                ₹{money(performance?.current_portfolio_value)}
              </div>
            </div>

            <div className="glass-card">
              <div className="card-label">
                Profit / Loss
              </div>

              <div
                className={
                  Number(performance?.profit_loss) >= 0
                    ? "card-value profit-text"
                    : "card-value loss-text"
                }
              >
                ₹{money(performance?.profit_loss)}
              </div>
            </div>

            <div className="content-card overview-information">

              <h3>
                Portfolio Information
              </h3>

              <div className="detail-list">

                <div>
                  <span>Manager</span>
                  <strong>
                    {portfolio.portfolio_manager}
                  </strong>
                </div>

                <div>
                  <span>Theme</span>
                  <strong>
                    {portfolio.theme_name}
                  </strong>
                </div>

                <div>
                  <span>Start Date</span>
                  <strong>
                    {portfolio.portfolio_start_date}
                  </strong>
                </div>

                <div>
                  <span>Rebalancing</span>
                  <strong>
                    {portfolio.rebalancing_frequency}
                  </strong>
                </div>

                <div>
                  <span>Benchmark</span>
                  <strong>
                    {portfolio.benchmark_name || "NIFTY 50"}
                  </strong>
                </div>

              </div>

            </div>

          </div>
        )
      }


      {/* =================================================
          SEARCH & BUY
      ================================================= */}

      {
        activeTab === "buy"
        &&
        (
          <div className="content-card">

            <h3>
              Search & Buy Security
            </h3>

            <p className="content-card-subtitle">
              Historical close price is used for the selected transaction date.
            </p>

            <form onSubmit={buySecurity}>

              <div className="buy-grid">

                <div className="form-group">

                  <label>
                    Transaction Date
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    min={portfolio.portfolio_start_date}
                    value={buyForm.transaction_date}
                    onChange={
                      event =>
                        setBuyForm(previous => ({
                          ...previous,
                          transaction_date: event.target.value
                        }))
                    }
                  />

                </div>


                <div className="form-group">

                  <label>
                    Asset Class
                  </label>

                  <select
                    className="form-control"
                    value={buyForm.asset_class_id}
                    onChange={
                      event => {

                        setBuyForm(previous => ({
                          ...previous,
                          asset_class_id: event.target.value,
                          search: "",
                          security_id: ""
                        }));

                        setSelectedSecurity(null);
                        setPricePreview(null);

                      }
                    }
                  >

                    <option value="">
                      Select Asset Class
                    </option>

                    {
                      assetClasses.map(item => (

                        <option
                          key={item.asset_class_id}
                          value={item.asset_class_id}
                        >
                          {item.asset_class_name}
                        </option>

                      ))
                    }

                  </select>

                </div>


                <div
                  className="form-group"
                  style={{ position: "relative" }}
                >

                  <label>
                    Security
                  </label>

                  <input
                    className="form-control"
                    disabled={!buyForm.asset_class_id}
                    placeholder="Type symbol or name"
                    value={buyForm.search}
                    onChange={
                      event =>
                        setBuyForm(previous => ({
                          ...previous,
                          search: event.target.value,
                          security_id: ""
                        }))
                    }
                  />

                  {
                    securities.length > 0
                    &&
                    (
                      <div className="security-dropdown">

                        {
                          securities.map(item => (

                            <button
                              type="button"
                              className="security-dropdown-item"
                              key={item.security_id}
                              onClick={() => chooseSecurity(item)}
                            >

                              <div>
                                <strong>
                                  {item.symbol}
                                </strong>

                                <span>
                                  {item.security_name}
                                </span>
                              </div>

                            </button>

                          ))
                        }

                      </div>
                    )
                  }

                </div>


                <div className="form-group">

                  <label>
                    {
                      portfolio.portfolio_type === "Amount"
                        ? "Investment Amount (₹)"
                        : "Portfolio Weightage (%)"
                    }
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    step="0.01"
                    value={buyForm.value}
                    onChange={
                      event =>
                        setBuyForm(previous => ({
                          ...previous,
                          value: event.target.value
                        }))
                    }
                  />

                </div>

              </div>


              {
                selectedSecurity
                &&
                (
                  <div className="selected-security-box">

                    <strong>
                      {selectedSecurity.symbol}
                    </strong>

                    <span>
                      {selectedSecurity.security_name}
                    </span>

                  </div>
                )
              }


              {
                pricePreview
                &&
                (
                  <div className="price-preview">

                    <div>
                      <span>
                        Requested Date
                      </span>
                      <strong>
                        {pricePreview.requested_date}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Actual Price Date
                      </span>
                      <strong>
                        {pricePreview.actual_price_date}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Historical Close
                      </span>
                      <strong>
                        ₹{money(pricePreview.price)}
                      </strong>
                    </div>

                  </div>
                )
              }


              <div className="form-actions">

                <button
                  type="submit"
                  className="primary-button"
                >
                  BUY Security
                </button>

              </div>

            </form>

          </div>
        )
      }


      {/* =================================================
          HOLDINGS
      ================================================= */}

      {
        activeTab === "holdings"
        &&
        (
          <div>

            {
              sellForm.security_id
              &&
              (
                <div className="content-card">

                  <div className="section-heading">

                    <div>
                      <h3>
                        Sell {sellForm.symbol}
                      </h3>

                      <p>
                        Available: {sellForm.quantity_owned} units
                      </p>
                    </div>

                    <button
                      type="button"
                      className="close-form-button"
                      onClick={
                        () =>
                          setSellForm({
                            security_id: "",
                            symbol: "",
                            quantity_owned: 0,
                            transaction_date: "",
                            quantity: ""
                          })
                      }
                    >
                      ×
                    </button>

                  </div>


                  <form onSubmit={sellSecurity}>

                    <div className="buy-grid">

                      <div className="form-group">

                        <label>
                          Sell Date
                        </label>

                        <input
                          type="date"
                          className="form-control"
                          min={portfolio.portfolio_start_date}
                          value={sellForm.transaction_date}
                          onChange={
                            event =>
                              setSellForm(previous => ({
                                ...previous,
                                transaction_date: event.target.value
                              }))
                          }
                        />

                      </div>


                      <div className="form-group">

                        <label>
                          Quantity
                        </label>

                        <input
                          type="number"
                          className="form-control"
                          min="1"
                          max={sellForm.quantity_owned}
                          value={sellForm.quantity}
                          onChange={
                            event =>
                              setSellForm(previous => ({
                                ...previous,
                                quantity: event.target.value
                              }))
                          }
                        />

                      </div>

                    </div>


                    <button
                      type="submit"
                      className="primary-button"
                    >
                      SELL Security
                    </button>

                  </form>

                </div>
              )
            }


            {
              holdings.length === 0
              ?
              (
                <div className="content-card">
                  <h3>No Holdings</h3>
                  <p className="content-card-subtitle">
                    Buy a security to create the first holding.
                  </p>
                </div>
              )
              :
              (
                <div className="holding-grid">

                  {
                    holdings.map(item => (

                      <div
                        className="holding-card"
                        key={item.holding_id}
                      >

                        <div className="holding-card-header">

                          <div>
                            <h3>
                              {item.symbol}
                            </h3>

                            <span>
                              {item.asset_class_name}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="small-action-button danger-button"
                            onClick={() => startSell(item)}
                          >
                            Sell
                          </button>

                        </div>


                        <div className="detail-list">

                          <div>
                            <span>Quantity</span>
                            <strong>
                              {item.quantity}
                            </strong>
                          </div>

                          <div>
                            <span>Avg Buy</span>
                            <strong>
                              ₹{money(item.average_buy_price)}
                            </strong>
                          </div>

                          <div>
                            <span>Latest</span>
                            <strong>
                              ₹{money(item.latest_price)}
                            </strong>
                          </div>

                          <div>
                            <span>Current Value</span>
                            <strong>
                              ₹{money(item.current_value)}
                            </strong>
                          </div>

                          <div>
                            <span>P/L</span>
                            <strong
                              className={
                                Number(item.profit_loss) >= 0
                                  ? "profit-text"
                                  : "loss-text"
                              }
                            >
                              ₹{money(item.profit_loss)}
                            </strong>
                          </div>

                        </div>

                      </div>

                    ))
                  }

                </div>
              )
            }

          </div>
        )
      }


      {/* =================================================
          TRANSACTIONS
      ================================================= */}

      {
        activeTab === "transactions"
        &&
        (
          <div className="content-card">

            {
              transactions.length === 0
              ?
              (
                <p className="content-card-subtitle">
                  No transactions available.
                </p>
              )
              :
              (
                <div className="table-wrapper">

                  <table className="dark-table">

                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Symbol</th>
                        <th>Type</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Amount</th>
                      </tr>
                    </thead>

                    <tbody>

                      {
                        transactions.map(item => (

                          <tr key={item.transaction_id}>

                            <td>
                              {item.transaction_date}
                            </td>

                            <td>
                              {item.symbol}
                            </td>

                            <td>
                              <span
                                className={
                                  item.transaction_type === "BUY"
                                    ? "transaction-buy"
                                    : "transaction-sell"
                                }
                              >
                                {item.transaction_type}
                              </span>
                            </td>

                            <td>
                              {item.quantity}
                            </td>

                            <td>
                              ₹{money(item.price)}
                            </td>

                            <td>
                              ₹{money(item.transaction_amount)}
                            </td>

                          </tr>

                        ))
                      }

                    </tbody>

                  </table>

                </div>
              )
            }

          </div>
        )
      }


      {/* =================================================
          ASSET ALLOCATION
      ================================================= */}

      {
        activeTab === "allocation"
        &&
        (
          allocation
            ?
            (
              <div>

                <div className="allocation-summary">

                  <strong>
                    Total Portfolio Value
                  </strong>

                  <span>
                    ₹{money(allocation.total_portfolio_value)}
                  </span>

                </div>

                <div className="allocation-card-grid">

                  {
                    allocation.allocations?.map(item => (

                      <div
                        className="allocation-card"
                        key={item.asset_class_id}
                      >

                        <h3>
                          {item.asset_class_name}
                        </h3>

                        <div className="allocation-percentages">

                          <div>
                            <span>Target</span>
                            <strong>
                              {item.target_percentage}%
                            </strong>
                          </div>

                          <div>
                            <span>Current</span>
                            <strong>
                              {item.current_percentage}%
                            </strong>
                          </div>

                          <div>
                            <span>Deviation</span>
                            <strong>
                              {item.deviation_percentage}%
                            </strong>
                          </div>

                        </div>

                        <div className="allocation-bar">

                          <div
                            className="allocation-bar-fill"
                            style={{
                              width:
                                `${Math.min(
                                  Number(item.current_percentage || 0),
                                  100
                                )}%`
                            }}
                          />

                        </div>

                      </div>

                    ))
                  }

                </div>

              </div>
            )
            :
            (
              <div className="content-card">
                <p className="content-card-subtitle">
                  Allocation data is not available.
                </p>
              </div>
            )
        )
      }


      {/* =================================================
          ALERTS
      ================================================= */}

      {
        activeTab === "alerts"
        &&
        (
          alerts.length === 0
            ?
            (
              <div className="content-card">
                <h3>No Alerts</h3>
                <p className="content-card-subtitle">
                  Current allocation is within the configured tolerance.
                </p>
              </div>
            )
            :
            (
              <div className="alert-page-grid">

                {
                  alerts.map(alert => (

                    <div
                      className="alert-page-card"
                      key={alert.alert_id}
                    >

                      <div className="alert-page-top">

                        <div>
                          <h3>
                            {alert.asset_class_name}
                          </h3>

                          <span
                            className={
                              alert.status === "RESOLVED"
                                ? "status-badge active-status"
                                : "status-badge new-status"
                            }
                          >
                            {alert.status}
                          </span>
                        </div>

                        <strong
                          className={
                            recommendationClass(
                              alert.recommendation_action
                            )
                          }
                        >
                          {alert.recommendation_action}
                        </strong>

                      </div>

                      <p>
                        {alert.alert_message}
                      </p>

                      <div className="detail-list">

                        <div>
                          <span>Target</span>
                          <strong>
                            {alert.target_percentage}%
                          </strong>
                        </div>

                        <div>
                          <span>Current</span>
                          <strong>
                            {alert.current_percentage}%
                          </strong>
                        </div>

                        <div>
                          <span>Recommendation</span>
                          <strong>
                            ₹{money(alert.recommendation_amount)}
                          </strong>
                        </div>

                      </div>

                      <div className="alert-actions">

                        {
                          alert.status === "NEW"
                          &&
                          (
                            <button
                              type="button"
                              className="small-action-button"
                              onClick={
                                () => markAlertRead(alert.alert_id)
                              }
                            >
                              Accept
                            </button>
                          )
                        }

                        {
                          alert.status !== "RESOLVED"
                          &&
                          (
                            <button
                              type="button"
                              className="small-action-button activate-button"
                              onClick={
                                () => {

                                  setActiveTab("rebalancing");

                                  loadSuggestions(
                                    alert.asset_class_id
                                  );

                                }
                              }
                            >
                              Change
                            </button>
                          )
                        }

                      </div>

                    </div>

                  ))
                }

              </div>
            )
        )
      }


      {/* =================================================
          REBALANCING
      ================================================= */}

      {
        activeTab === "rebalancing"
        &&
        (
          <div>

            {
              rebalancing?.recommendations?.length > 0
              ?
              (
                <div className="rebalancing-grid">

                  {
                    rebalancing.recommendations.map(item => (

                      <div
                        className="rebalancing-card"
                        key={item.asset_class_id}
                      >

                        <div className="rebalancing-top">

                          <h3>
                            {item.asset_class_name}
                          </h3>

                          <span
                            className={
                              recommendationClass(
                                item.recommendation_action
                              )
                            }
                          >
                            {item.recommendation_action}
                          </span>

                        </div>

                        <div className="detail-list">

                          <div>
                            <span>Target</span>
                            <strong>
                              {item.target_percentage}%
                            </strong>
                          </div>

                          <div>
                            <span>Current</span>
                            <strong>
                              {item.current_percentage}%
                            </strong>
                          </div>

                          <div>
                            <span>Deviation</span>
                            <strong>
                              {item.deviation_percentage}%
                            </strong>
                          </div>

                          <div>
                            <span>Recommended Amount</span>
                            <strong>
                              ₹{money(item.recommendation_amount)}
                            </strong>
                          </div>

                        </div>

                        {
                          item.recommendation_action !== "HOLD"
                          &&
                          (
                            <button
                              type="button"
                              className="small-action-button"
                              onClick={
                                () =>
                                  loadSuggestions(
                                    item.asset_class_id
                                  )
                              }
                            >
                              View Suggestions
                            </button>
                          )
                        }

                      </div>

                    ))
                  }

                </div>
              )
              :
              (
                <div className="content-card">

                  <h3>Rebalancing</h3>

                  <p className="content-card-subtitle">
                    Rebalancing data is not available.
                    Make sure GET /api/portfolios/{portfolioId}/rebalancing exists in Swagger.
                  </p>

                </div>
              )
            }


            {
              suggestions
              &&
              (
                <div className="content-card suggestion-panel">

                  <div className="section-heading">

                    <div>

                      <h3>
                        {suggestions.asset_class_name}
                        {" — "}
                        {suggestions.action}
                      </h3>

                      <p>
                        Recommended amount:
                        {" "}
                        ₹{money(suggestions.recommended_amount)}
                      </p>

                    </div>

                    <button
                      type="button"
                      className="close-form-button"
                      onClick={() => setSuggestions(null)}
                    >
                      ×
                    </button>

                  </div>


                  {
                    suggestions.message
                    &&
                    (
                      <p className="suggestion-message">
                        {suggestions.message}
                      </p>
                    )
                  }


                  {
                    Array.isArray(suggestions.related_asset_classes)
                    &&
                    suggestions.related_asset_classes.length > 0
                    &&
                    (
                      <div className="suggestion-grid">

                        {
                          suggestions.related_asset_classes.map(item => (

                            <div
                              className="suggestion-card"
                              key={item.asset_class_id}
                            >

                              <h3>
                                {item.asset_class_name}
                              </h3>

                              <p>
                                {item.action}
                              </p>

                              <div className="detail-list">

                                <div>
                                  <span>Recommended</span>
                                  <strong>
                                    ₹{money(item.recommended_amount)}
                                  </strong>
                                </div>

                              </div>

                              <button
                                type="button"
                                className="primary-button"
                                onClick={
                                  () =>
                                    loadSuggestions(
                                      item.asset_class_id
                                    )
                                }
                              >
                                View Securities
                              </button>

                            </div>

                          ))
                        }

                      </div>
                    )
                  }


                  {
                    Array.isArray(suggestions.suggestions)
                    &&
                    suggestions.suggestions.length > 0
                    &&
                    (
                      <div className="suggestion-grid">

                        {
                          suggestions.suggestions.map(item => (

                            <div
                              className="suggestion-card"
                              key={item.security_id}
                            >

                              <h3>
                                {item.symbol}
                              </h3>

                              <p>
                                {item.security_name}
                              </p>

                              <div className="detail-list">

                                <div>
                                  <span>Latest</span>
                                  <strong>
                                    ₹{money(item.latest_price)}
                                  </strong>
                                </div>

                                {
                                  suggestions.action === "INCREASE"
                                  &&
                                  (
                                    <>
                                      <div>
                                        <span>Suggested Qty</span>
                                        <strong>
                                          {item.suggested_quantity}
                                        </strong>
                                      </div>

                                      <div>
                                        <span>Suggested Investment</span>
                                        <strong>
                                          ₹{money(item.suggested_investment)}
                                        </strong>
                                      </div>
                                    </>
                                  )
                                }

                                {
                                  suggestions.action === "REDUCE"
                                  &&
                                  (
                                    <>
                                      <div>
                                        <span>Owned</span>
                                        <strong>
                                          {item.quantity_owned}
                                        </strong>
                                      </div>

                                      <div>
                                        <span>Suggested Sell</span>
                                        <strong>
                                          {item.suggested_quantity_to_sell}
                                        </strong>
                                      </div>

                                      <div>
                                        <span>Suggested Sell Value</span>
                                        <strong>
                                          ₹{money(item.suggested_sell_value)}
                                        </strong>
                                      </div>
                                    </>
                                  )
                                }

                              </div>

                              {
                                suggestions.action === "INCREASE"
                                &&
                                (
                                  <button
                                    type="button"
                                    className="primary-button"
                                    onClick={() => useBuySuggestion(item)}
                                  >
                                    Buy This Security
                                  </button>
                                )
                              }

                              {
                                suggestions.action === "REDUCE"
                                &&
                                (
                                  <button
                                    type="button"
                                    className="primary-button"
                                    onClick={() => useSellSuggestion(item)}
                                  >
                                    Sell This Holding
                                  </button>
                                )
                              }

                            </div>

                          ))
                        }

                      </div>
                    )
                  }


                  {
                    (
                      !Array.isArray(suggestions.suggestions)
                      ||
                      suggestions.suggestions.length === 0
                    )
                    &&
                    (
                      !Array.isArray(suggestions.related_asset_classes)
                      ||
                      suggestions.related_asset_classes.length === 0
                    )
                    &&
                    (
                      <p className="content-card-subtitle">
                        No direct security suggestion is required for this item.
                      </p>
                    )
                  }

                </div>
              )
            }

          </div>
        )
      }


      {/* =================================================
          PERFORMANCE
      ================================================= */}

      {
        activeTab === "performance"
        &&
        (
          performance
            ?
            (
              <div className="performance-grid">

                <div className="glass-card">
                  <div className="card-label">
                    Current Portfolio Value
                  </div>
                  <div className="card-value">
                    ₹{money(performance.current_portfolio_value)}
                  </div>
                </div>

                <div className="glass-card">
                  <div className="card-label">
                    Profit / Loss
                  </div>
                  <div
                    className={
                      Number(performance.profit_loss) >= 0
                        ? "card-value profit-text"
                        : "card-value loss-text"
                    }
                  >
                    ₹{money(performance.profit_loss)}
                  </div>
                </div>

                <div className="glass-card">
                  <div className="card-label">
                    Portfolio Return
                  </div>
                  <div className="card-value">
                    {money(performance.portfolio_return_percentage)}%
                  </div>
                </div>

                <div className="glass-card">
                  <div className="card-label">
                    NIFTY 50 Return
                  </div>
                  <div className="card-value">
                    {money(performance.benchmark_return_percentage)}%
                  </div>
                </div>

                <div className="content-card performance-comparison">

                  <h3>
                    Relative Performance
                  </h3>

                  <div
                    className={
                      Number(
                        performance.relative_performance_percentage
                      ) >= 0
                        ? "relative-value profit-text"
                        : "relative-value loss-text"
                    }
                  >
                    {
                      money(
                        performance.relative_performance_percentage
                      )
                    }
                    %
                  </div>

                  <p className="content-card-subtitle">
                    {performance.comparison}
                  </p>

                  <div className="detail-list">

                    <div>
                      <span>Benchmark Start</span>
                      <strong>
                        {money(performance.benchmark_start_value)}
                      </strong>
                    </div>

                    <div>
                      <span>Latest Benchmark</span>
                      <strong>
                        {money(performance.benchmark_current_value)}
                      </strong>
                    </div>

                    <div>
                      <span>Latest Benchmark Date</span>
                      <strong>
                        {performance.benchmark_latest_date}
                      </strong>
                    </div>

                  </div>

                </div>

              </div>
            )
            :
            (
              <div className="content-card">

                <h3>Performance</h3>

                <p className="content-card-subtitle">
                  Performance data is not available.
                  Make sure GET /api/portfolios/{portfolioId}/performance exists in Swagger.
                </p>

              </div>
            )
        )
      }

    </div>

  );

}


export default PortfolioDetails;
