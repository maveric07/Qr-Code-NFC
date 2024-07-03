document.addEventListener("DOMContentLoaded", async function () {
  const ShortId = window.location.pathname.split("/").pop();
  const response = await fetch(`/url/report/data/${ShortId}`);
  const data = await response.json();

  // Set activation and expiry dates
  document.getElementById(
    "activationDate"
  ).textContent = `Activation Date: ${new Date(
    data.activationDate
  ).toLocaleString()}`;
  document.getElementById("expiryDate").textContent = `Expiry Date: ${new Date(
    data.expiryDate
  ).toLocaleString()}`;

  // Load the Visualization API and the corechart package
  google.charts.load("current", { packages: ["corechart", "calendar"] });

  // Set a callback to run when the Google Visualization API is loaded
  google.charts.setOnLoadCallback(() => {
    drawChart("bar", data);
  });

  const chartTypeSelector = document.getElementById("chartType");
  chartTypeSelector.addEventListener("change", () => {
    drawChart(chartTypeSelector.value, data);
  });

  function drawChart(type, data) {
    if (type === "heatmap") {
      drawHeatmap(data);
    } else {
      drawCoreChart(type, data);
    }
  }

  function drawCoreChart(type, data) {
    const chartData = new google.visualization.DataTable();
    chartData.addColumn("string", "Date");
    chartData.addColumn("number", "Visits");
    data.labels.forEach((label, index) => {
      chartData.addRow([label, data.data[index]]);
    });

    const options = {
      title: "Visits per Day",
      width: 800,
      height: 400,
      hAxis: {
        title: "Date",
      },
      vAxis: {
        title: "Visits",
        minValue: 0,
      },
    };

    let chart;
    if (type === "bar") {
      chart = new google.visualization.BarChart(
        document.getElementById("chart")
      );
    } else if (type === "column") {
      chart = new google.visualization.ColumnChart(
        document.getElementById("chart")
      );
    } else if (type === "pie") {
      chart = new google.visualization.PieChart(
        document.getElementById("chart")
      );
    }

    chart.draw(chartData, options);
  }

  function drawHeatmap(data) {
    const heatmapData = new google.visualization.DataTable();
    heatmapData.addColumn({ type: "date", id: "Date" });
    heatmapData.addColumn({ type: "number", id: "Visits" });
    data.labels.forEach((label, index) => {
      const parts = label.split("/");
      const date = new Date(parts[2], parts[0] - 1, parts[1]); // assuming mm/dd/yyyy format
      heatmapData.addRow([date, data.data[index]]);
    });

    const options = {
      title: "Visits",
      height: 500,
      calendar: {
        cellSize: 15,
        yearLabel: {
          fontName: "Arial",
          fontSize: 32,
          color: "SlateBlue",
          bold: true,
          italic: true,
        },
        monthLabel: {
          fontName: "Arial",
          fontSize: 12,
          color: "SlateBlue",
          bold: true,
          italic: true,
        },
        dayOfWeekLabel: {
          fontName: "Arial",
          fontSize: 12,
          color: "SlateBlue",
          bold: true,
          italic: false,
        },
        noDataPattern: {
          backgroundColor: "#76a7fa",
          color: "#a0c3ff",
        },
        dayOfWeekRightSpace: 10,
        daysOfWeek: "SMTWTFS",
        colorAxis: {
          minValue: 0,
          colors: ["#f00", "#0f0", "#00f"], // Red to green to blue
        },
      },
    };

    const chart = new google.visualization.Calendar(
      document.getElementById("chart")
    );
    chart.draw(heatmapData, options);
  }
});

// document.addEventListener("DOMContentLoaded", async function () {
//   const ShortId = window.location.pathname.split("/").pop();
//   const response = await fetch(`/url/report/data/${ShortId}`);
//   const data = await response.json();

//   // Load the Visualization API and the corechart package
//   google.charts.load("current", { packages: ["corechart", "calendar"] });

//   // Set a callback to run when the Google Visualization API is loaded
//   google.charts.setOnLoadCallback(() => {
//     drawChart("bar", data);
//   });

//   const chartTypeSelector = document.getElementById("chartType");
//   chartTypeSelector.addEventListener("change", () => {
//     drawChart(chartTypeSelector.value, data);
//   });

//   function drawChart(type, data) {
//     if (type === "heatmap") {
//       drawHeatmap(data);
//     } else {
//       drawCoreChart(type, data);
//     }
//   }

//   function drawCoreChart(type, data) {
//     const chartData = new google.visualization.DataTable();
//     chartData.addColumn("string", "Date");
//     chartData.addColumn("number", "Visits");
//     data.labels.forEach((label, index) => {
//       chartData.addRow([label, data.data[index]]);
//     });

//     const options = {
//       title: "Visits per Day",
//       width: 800,
//       height: 400,
//       hAxis: {
//         title: "Date",
//       },
//       vAxis: {
//         title: "Visits",
//         minValue: 0,
//       },
//     };

//     let chart;
//     if (type === "bar") {
//       chart = new google.visualization.BarChart(
//         document.getElementById("chart")
//       );
//     } else if (type === "column") {
//       chart = new google.visualization.ColumnChart(
//         document.getElementById("chart")
//       );
//     } else if (type === "pie") {
//       chart = new google.visualization.PieChart(
//         document.getElementById("chart")
//       );
//     }

//     chart.draw(chartData, options);
//   }

//   function drawHeatmap(data) {
//     const heatmapData = new google.visualization.DataTable();
//     heatmapData.addColumn({ type: "date", id: "Date" });
//     heatmapData.addColumn({ type: "number", id: "Visits" });
//     data.labels.forEach((label, index) => {
//       const parts = label.split("/");
//       const date = new Date(parts[2], parts[0] - 1, parts[1]); // assuming mm/dd/yyyy format
//       heatmapData.addRow([date, data.data[index]]);
//     });

//     const options = {
//       title: "Visits",
//       height: 500,
//       calendar: {
//         cellSize: 15,
//         yearLabel: {
//           fontName: "Arial",
//           fontSize: 32,
//           // color: "#1A8763",
//           color: "SlateBlue",
//           bold: true,
//           italic: true,
//         },
//         monthLabel: {
//           fontName: "Arial",
//           fontSize: 12,
//           // color: "#981b48",
//           color: "SlateBlue",
//           bold: true,
//           italic: true,
//         },
//         dayOfWeekLabel: {
//           fontName: "Arial",
//           fontSize: 12,
//           // color: "#981b48",
//           color: "SlateBlue",
//           bold: true,
//           italic: false,
//         },
//         noDataPattern: {
//           backgroundColor: "#76a7fa",
//           color: "#a0c3ff",
//         },
//         dayOfWeekRightSpace: 10,
//         daysOfWeek: "SMTWTFS",
//         colorAxis: {
//           minValue: 0,
//           colors: ["#f00", "#0f0", "#00f"], // Red to green to blue
//         },
//       },
//     };

//     const chart = new google.visualization.Calendar(
//       document.getElementById("chart")
//     );
//     chart.draw(heatmapData, options);
//   }
// });
