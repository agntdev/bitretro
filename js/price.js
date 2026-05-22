/* ============================================================================
   BitRetro — Real-Time Bitcoin Data
   T03: Real-Time Bitcoin Price Tracking
   ----------------------------------------------------------------------------
   Pulls live Bitcoin market data (CoinGecko) and on-chain throughput
   (mempool.space) and renders it into the data-field hooks defined in T02.

   - Price, 1h change, 24h change, market cap, volume, 24h high/low
   - Transactions per Second / Minute / Hour + latest block height
   - Loading + error states per panel
   - Auto-refresh every 30 seconds
   ========================================================================== */
(function () {
  "use strict";

  var PRICE_URL =
    "https://api.coingecko.com/api/v3/coins/markets" +
    "?vs_currency=usd&ids=bitcoin&price_change_percentage=1h,24h&precision=2";
  var BLOCKS_URL = "https://mempool.space/api/v1/blocks";
  var REFRESH_MS = 30000;
  var FETCH_TIMEOUT_MS = 12000;

  /* --- Formatting helpers --------------------------------------------- */
  var usd = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 2,
  });
  var usd0 = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0,
  });
  var usdCompact = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2,
  });
  var num = new Intl.NumberFormat("en-US");

  function pct(n) {
    if (n === null || n === undefined || isNaN(n)) return "—";
    var sign = n > 0 ? "+" : "";
    return sign + n.toFixed(2) + "%";
  }

  function timeString(d) {
    return d.toLocaleTimeString("en-US", { hour12: false });
  }

  /* --- DOM helpers ----------------------------------------------------- */
  function $(id) { return document.getElementById(id); }

  function setText(id, value) {
    var el = $(id);
    if (el) el.textContent = value;
  }

  /* Toggle a loading shimmer on a group of data-field elements. */
  function setLoading(ids, on) {
    ids.forEach(function (id) {
      var el = $(id);
      if (el) el.classList.toggle("is-loading", !!on);
    });
  }

  /* Colour a delta pill by sign and write its label. */
  function setDelta(id, label, value) {
    var el = $(id);
    if (!el) return;
    el.classList.remove("pill--up", "pill--down");
    if (value > 0) el.classList.add("pill--up");
    else if (value < 0) el.classList.add("pill--down");
    el.textContent = label + " " + pct(value);
  }

  /* fetch() with a hard timeout so a hung request never freezes refresh. */
  function fetchJSON(url) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, FETCH_TIMEOUT_MS);
    return fetch(url, { signal: ctrl.signal, headers: { accept: "application/json" } })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .finally(function () { clearTimeout(timer); });
  }

  var PRICE_FIELDS = ["btc-price", "market-cap", "volume", "high-24h", "low-24h"];
  var NET_FIELDS = ["tps", "tpm", "tph", "block-height"];

  /* --- Price + market data -------------------------------------------- */
  function updatePrice() {
    setLoading(PRICE_FIELDS, true);
    return fetchJSON(PRICE_URL)
      .then(function (data) {
        var c = Array.isArray(data) ? data[0] : null;
        if (!c) throw new Error("empty payload");

        setText("btc-price", usd.format(c.current_price));
        setText("market-cap", usdCompact.format(c.market_cap));
        setText("volume", usdCompact.format(c.total_volume));
        setText("high-24h", usd0.format(c.high_24h));
        setText("low-24h", usd0.format(c.low_24h));

        var ch1h = c.price_change_percentage_1h_in_currency;
        var ch24h = c.price_change_percentage_24h_in_currency;
        if (ch24h === null || ch24h === undefined) ch24h = c.price_change_percentage_24h;
        setDelta("btc-change-1h", "1h", ch1h);
        setDelta("btc-change-24h", "24h", ch24h);

        setText("last-update", timeString(new Date()));
        clearStatus();
      })
      .catch(function (err) {
        showStatus("Price feed unavailable — retrying. (" + err.message + ")");
      })
      .finally(function () { setLoading(PRICE_FIELDS, false); });
  }

  /* --- On-chain throughput (TPS / TPM / TPH) -------------------------- */
  function updateNetwork() {
    setLoading(NET_FIELDS, true);
    return fetchJSON(BLOCKS_URL)
      .then(function (blocks) {
        if (!Array.isArray(blocks) || blocks.length < 2) throw new Error("no blocks");

        setText("block-height", num.format(blocks[0].height));

        var newest = blocks[0];
        var oldest = blocks[blocks.length - 1];
        var totalTx = blocks.reduce(function (sum, b) {
          return sum + (b.tx_count || 0);
        }, 0);
        var spanSec = newest.timestamp - oldest.timestamp;

        if (spanSec > 0) {
          var tps = totalTx / spanSec;
          setText("tps", tps.toFixed(1));
          setText("tpm", num.format(Math.round(tps * 60)));
          setText("tph", num.format(Math.round(tps * 3600)));
        }
      })
      .catch(function () {
        /* Network panel is secondary — leave placeholders, don't block price. */
        NET_FIELDS.forEach(function (id) {
          var el = $(id);
          if (el && (el.textContent === "—" || el.textContent === "")) el.textContent = "—";
        });
      })
      .finally(function () { setLoading(NET_FIELDS, false); });
  }

  /* --- Status / error banner ------------------------------------------ */
  function showStatus(msg) {
    var el = $("data-status");
    if (el) { el.textContent = msg; el.hidden = false; }
  }
  function clearStatus() {
    var el = $("data-status");
    if (el) { el.textContent = ""; el.hidden = true; }
  }

  /* --- Refresh loop ---------------------------------------------------- */
  var timer = null;

  function refreshAll() {
    return Promise.all([updatePrice(), updateNetwork()]);
  }

  function start() {
    refreshAll();
    timer = setInterval(refreshAll, REFRESH_MS);
  }

  /* Pause polling when the tab is hidden; resume (and refresh) on return. */
  function handleVisibility() {
    if (document.hidden) {
      if (timer) { clearInterval(timer); timer = null; }
    } else if (!timer) {
      start();
    }
  }

  function init() {
    if (!("fetch" in window)) {
      showStatus("This browser does not support live data (fetch unavailable).");
      return;
    }
    document.addEventListener("visibilitychange", handleVisibility);
    start();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
