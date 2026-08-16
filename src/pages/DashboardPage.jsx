import { useEffect, useMemo, useState } from "react";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { db } from "../services/firebase";

import "./dashboard.css";


// =========================================================
// DATE HELPERS
// =========================================================

const formatDate = (date) => {
  return date.toISOString().split("T")[0];
};

const getStartOfMonth = () => {
  const date = new Date();

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  );
};

const getStartOfYear = () => {
  const date = new Date();

  return new Date(
    date.getFullYear(),
    0,
    1
  );
};


// =========================================================
// DASHBOARD
// =========================================================

export default function DashboardPage() {
  const [orders, setOrders] =
    useState([]);

  const [stockItems, setStockItems] =
    useState([]);

  const [inventory, setInventory] =
    useState([]);

  /*
   * Temporary employee salaries.
   *
   * Ideally this should come from:
   *
   * employees collection
   *
   * {
   *   name: "Rahul",
   *   salary: 25000
   * }
   */

  const [employees, setEmployees] =
    useState([
      {
        id: "emp-1",
        name: "Rahul",
        salary: 25000,
      },
      {
        id: "emp-2",
        name: "Amit",
        salary: 22000,
      },
      {
        id: "emp-3",
        name: "Suresh",
        salary: 20000,
      },
    ]);


  // =======================================================
  // DATE FILTER
  // =======================================================

  const [dateRange, setDateRange] =
    useState("month");

  const [customStart, setCustomStart] =
    useState("");

  const [customEnd, setCustomEnd] =
    useState("");


  // =======================================================
  // FIREBASE
  // =======================================================

  useEffect(() => {
    const unsubOrders =
      onSnapshot(
        collection(db, "orders"),
        (snapshot) => {
          setOrders(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          );
        }
      );

    const unsubStock =
      onSnapshot(
        collection(db, "dailyStock"),
        (snapshot) => {
          setStockItems(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          );
        }
      );

    const unsubInventory =
      onSnapshot(
        collection(db, "inventory"),
        (snapshot) => {
          setInventory(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          );
        }
      );

    return () => {
      unsubOrders();
      unsubStock();
      unsubInventory();
    };
  }, []);


  // =======================================================
  // DATE RANGE
  // =======================================================

  const dateFilter = useMemo(() => {
    const today =
      new Date();

    const end =
      new Date();

    end.setHours(
      23,
      59,
      59,
      999
    );

    let start;

    if (dateRange === "today") {
      start =
        new Date();

      start.setHours(
        0,
        0,
        0,
        0
      );
    }

    else if (
      dateRange === "week"
    ) {
      start =
        new Date();

      start.setDate(
        today.getDate() - 6
      );

      start.setHours(
        0,
        0,
        0,
        0
      );
    }

    else if (
      dateRange === "month"
    ) {
      start =
        getStartOfMonth();

      start.setHours(
        0,
        0,
        0,
        0
      );
    }

    else if (
      dateRange === "year"
    ) {
      start =
        getStartOfYear();

      start.setHours(
        0,
        0,
        0,
        0
      );
    }

    else if (
      dateRange === "custom" &&
      customStart
    ) {
      start =
        new Date(
          `${customStart}T00:00:00`
        );

      if (customEnd) {
        end.setTime(
          new Date(
            `${customEnd}T23:59:59`
          ).getTime()
        );
      }
    }

    else {
      start =
        getStartOfMonth();
    }

    return {
      start,
      end,
    };
  }, [
    dateRange,
    customStart,
    customEnd,
  ]);


  // =======================================================
  // FILTER ORDERS
  // =======================================================

  const filteredOrders =
    useMemo(() => {
      return orders.filter(
        (order) => {
          if (
            order.status !==
            "completed"
          ) {
            return false;
          }

          const date =
            getOrderDate(order);

          if (!date) {
            return false;
          }

          return (
            date >=
              dateFilter.start &&
            date <=
              dateFilter.end
          );
        }
      );
    }, [
      orders,
      dateFilter,
    ]);


  // =======================================================
  // FILTER EXPENSES
  // =======================================================

  const filteredExpenses =
    useMemo(() => {
      return stockItems.filter(
        (item) => {
          const date =
            getStockDate(item);

          if (!date) {
            return false;
          }

          return (
            date >=
              dateFilter.start &&
            date <=
              dateFilter.end
          );
        }
      );
    }, [
      stockItems,
      dateFilter,
    ]);


  // =======================================================
  // SALES
  // =======================================================

  const totalSales =
    filteredOrders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.total || 0
        ),
      0
    );


  // =======================================================
  // EXPENSES
  // =======================================================

  const totalExpenses =
    filteredExpenses.reduce(
      (sum, item) =>
        sum +
        Number(
          item.amount ??
          item.cost ??
          0
        ),
      0
    );


  // =======================================================
  // PROFIT
  // =======================================================

  const profit =
    totalSales -
    totalExpenses;


  // =======================================================
  // PENDING ORDERS
  // =======================================================

  const pendingOrders =
    orders.filter(
      (order) =>
        order.status ===
        "pending"
    ).length;


  // =======================================================
  // LOW STOCK
  // =======================================================

  const lowStockItems =
    inventory.filter(
      (item) =>
        Number(item.stock || 0) <=
        Number(
          item.lowStock || 0
        )
    );


  // =======================================================
  // CHART DATA
  // =======================================================

  const chartData =
    useMemo(() => {
      const map = {};

      filteredOrders.forEach(
        (order) => {
          const date =
            getOrderDateString(
              order
            );

          if (!date) return;

          if (!map[date]) {
            map[date] = {
              date,
              sales: 0,
              expenses: 0,
            };
          }

          map[date].sales +=
            Number(
              order.total || 0
            );
        }
      );

      filteredExpenses.forEach(
        (expense) => {
          const date =
            getStockDateString(
              expense
            );

          if (!date) return;

          if (!map[date]) {
            map[date] = {
              date,
              sales: 0,
              expenses: 0,
            };
          }

          map[date].expenses +=
            Number(
              expense.amount ??
              expense.cost ??
              0
            );
        }
      );

      return Object.values(map)
        .sort(
          (a, b) =>
            new Date(a.date) -
            new Date(b.date)
        )
        .map((item) => ({
          ...item,
          label:
            formatChartDate(
              item.date
            ),
        }));
    }, [
      filteredOrders,
      filteredExpenses,
    ]);


  // =======================================================
  // MOST SOLD ITEMS
  // =======================================================

  const mostSoldItems =
    useMemo(() => {
      const sold = {};

      filteredOrders.forEach(
        (order) => {
          /*
           * Supports:
           *
           * order.items
           *
           * [
           *   {
           *     name: "Paneer",
           *     qty: 2
           *   }
           * ]
           */

          const orderItems =
            order.items || [];

          orderItems.forEach(
            (item) => {
              const name =
                item.name ||
                "Unknown";

              const qty =
                Number(
                  item.qty ||
                  item.quantity ||
                  0
                );

              if (!sold[name]) {
                sold[name] = 0;
              }

              sold[name] += qty;
            }
          );
        }
      );

      return Object.entries(
        sold
      )
        .map(
          ([name, quantity]) => ({
            name,
            quantity,
          })
        )
        .sort(
          (a, b) =>
            b.quantity -
            a.quantity
        )
        .slice(0, 5);
    }, [
      filteredOrders,
    ]);


  // =======================================================
  // SALARY
  // =======================================================

  const salaryData =
    useMemo(() => {
      /*
       * Salary should always represent
       * the current month.
       */

      const currentMonth =
        new Date();

      const month =
        currentMonth.getMonth();

      const year =
        currentMonth.getFullYear();

      return employees.map(
        (employee) => {
          const employeeExpenses =
            stockItems
              .filter(
                (item) => {
                  if (
                    item.type !==
                    "employee"
                  ) {
                    return false;
                  }

                  if (
                    item.employeeId !==
                    employee.id
                  ) {
                    return false;
                  }

                  if (
                    !item.deductFromSalary
                  ) {
                    return false;
                  }

                  const date =
                    getStockDate(
                      item
                    );

                  if (!date) {
                    return false;
                  }

                  return (
                    date.getMonth() ===
                      month &&
                    date.getFullYear() ===
                      year
                  );
                }
              )
              .reduce(
                (sum, item) =>
                  sum +
                  Number(
                    item.amount ??
                    item.cost ??
                    0
                  ),
                0
              );

          return {
            ...employee,

            deductions:
              employeeExpenses,

            payable:
              Math.max(
                0,
                Number(
                  employee.salary
                ) -
                  employeeExpenses
              ),
          };
        }
      );
    }, [
      employees,
      stockItems,
    ]);


  const totalSalary =
    salaryData.reduce(
      (sum, employee) =>
        sum +
        employee.payable,
      0
    );


  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="dashboard-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="dashboard-header">

        <div>
          <h2>
            Dashboard
          </h2>

          <p>
            Business overview
          </p>
        </div>

        <div className="date-filter">

          <select
            value={dateRange}
            onChange={(e) =>
              setDateRange(
                e.target.value
              )
            }
          >
            <option value="today">
              Today
            </option>

            <option value="week">
              Last 7 Days
            </option>

            <option value="month">
              This Month
            </option>

            <option value="year">
              This Year
            </option>

            <option value="custom">
              Custom
            </option>
          </select>

          {dateRange ===
            "custom" && (
            <>
              <input
                type="date"
                value={
                  customStart
                }
                onChange={(e) =>
                  setCustomStart(
                    e.target.value
                  )
                }
              />

              <input
                type="date"
                value={
                  customEnd
                }
                onChange={(e) =>
                  setCustomEnd(
                    e.target.value
                  )
                }
              />
            </>
          )}

        </div>

      </div>


      {/* =================================================
          KPI
      ================================================= */}

      <div className="dashboard-grid">

        <div className="dashboard-card sales">

          <span>
            Sales
          </span>

          <strong>
            ₹
            {totalSales.toLocaleString(
              "en-IN"
            )}
          </strong>

          <small>
            Completed orders
          </small>

        </div>


        <div className="dashboard-card expense">

          <span>
            Expenses
          </span>

          <strong>
            ₹
            {totalExpenses.toLocaleString(
              "en-IN"
            )}
          </strong>

          <small>
            Purchases & expenses
          </small>

        </div>


        <div className="dashboard-card profit">

          <span>
            Profit
          </span>

          <strong>
            ₹
            {profit.toLocaleString(
              "en-IN"
            )}
          </strong>

          <small>
            Sales − Expenses
          </small>

        </div>


        <div className="dashboard-card pending">

          <span>
            Pending Orders
          </span>

          <strong>
            {pendingOrders}
          </strong>

          <small>
            Need attention
          </small>

        </div>

      </div>


      {/* =================================================
          SALES VS EXPENSE CHART
      ================================================= */}

      <div className="dashboard-main-grid">

        <div className="dashboard-panel chart-panel">

          <div className="panel-header">

            <div>
              <h3>
                Sales vs Expenses
              </h3>

              <p>
                Compare your business
                performance
              </p>
            </div>

            <div className="chart-summary">

              <span>
                Sales
                <strong>
                  ₹
                  {totalSales.toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </span>

              <span>
                Expense
                <strong>
                  ₹
                  {totalExpenses.toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </span>

            </div>

          </div>

          <div className="chart-container">

            {chartData.length ===
            0 ? (
              <div className="chart-empty">
                No data available
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={
                    chartData
                  }
                  margin={{
                    top: 10,
                    right: 10,
                    left: -15,
                    bottom: 0,
                  }}
                >

                  <CartesianGrid
                    stroke="#eeeeee"
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#999",
                      fontSize: 9,
                    }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#999",
                      fontSize: 9,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      border:
                        "1px solid #eee",
                      borderRadius:
                        "8px",
                      fontSize:
                        "10px",
                      boxShadow:
                        "0 5px 20px rgba(0,0,0,.08)",
                    }}
                    formatter={(value) =>
                      `₹${Number(
                        value
                      ).toLocaleString(
                        "en-IN"
                      )}`
                    }
                  />

                  <Legend
                    wrapperStyle={{
                      fontSize:
                        "9px",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="sales"
                    name="Sales"
                    stroke="#111"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 4,
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#d99a3d"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 4,
                    }}
                  />

                </LineChart>
              </ResponsiveContainer>
            )}

          </div>

        </div>


        {/* =================================================
            MOST SOLD
        ================================================= */}

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>
              <h3>
                Most Sold
              </h3>

              <p>
                Top performing items
              </p>
            </div>

          </div>

          <div className="most-sold-list">

            {mostSoldItems.length ===
            0 ? (
              <div className="panel-empty">
                No sales data
              </div>
            ) : (
              mostSoldItems.map(
                (item, index) => (
                  <div
                    key={item.name}
                    className="most-sold-item"
                  >

                    <div className="rank">
                      {index + 1}
                    </div>

                    <div className="sold-item-info">

                      <strong>
                        {item.name}
                      </strong>

                      <div className="sold-progress">

                        <span
                          style={{
                            width: `${getProgress(
                              item.quantity,
                              mostSoldItems[0]
                                .quantity
                            )}%`,
                          }}
                        />

                      </div>

                    </div>

                    <strong className="sold-qty">
                      {item.quantity}
                    </strong>

                  </div>
                )
              )
            )}

          </div>

        </div>

      </div>


      {/* =================================================
          SALARY + LOW STOCK
      ================================================= */}

      <div className="dashboard-bottom-grid">

        {/* ===============================================
            SALARY
        =============================================== */}

        <div className="dashboard-panel salary-panel">

          <div className="panel-header">

            <div>
              <h3>
                Salary
              </h3>

              <p>
                This month's payable
                salary after deductions
              </p>
            </div>

            <div className="salary-total">
              ₹
              {totalSalary.toLocaleString(
                "en-IN"
              )}
            </div>

          </div>

          <div className="salary-list">

            {salaryData.map(
              (employee) => (
                <div
                  key={employee.id}
                  className="salary-row"
                >

                  <div className="employee-info">

                    <div className="employee-avatar">
                      {employee.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>

                      <strong>
                        {employee.name}
                      </strong>

                      <small>
                        Salary ₹
                        {Number(
                          employee.salary
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </small>

                    </div>

                  </div>


                  <div className="salary-deduction">

                    {employee.deductions >
                      0 && (
                      <small>
                        − ₹
                        {employee.deductions.toLocaleString(
                          "en-IN"
                        )}
                      </small>
                    )}

                    <strong>
                      ₹
                      {employee.payable.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                </div>
              )
            )}

          </div>

        </div>


        {/* ===============================================
            LOW STOCK
        =============================================== */}

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>
              <h3>
                Low Stock
              </h3>

              <p>
                Items requiring attention
              </p>
            </div>

            <span className="alert-count">
              {lowStockItems.length}
            </span>

          </div>

          <div className="low-stock-list">

            {lowStockItems.length ===
            0 ? (
              <div className="panel-empty">
                ✓ All items are
                sufficiently stocked
              </div>
            ) : (
              lowStockItems
                .slice(0, 7)
                .map(
                  (item) => (
                    <div
                      key={item.id}
                      className="low-stock-row"
                    >

                      <span>
                        {item.name}
                      </span>

                      <strong>
                        {item.stock}
                      </strong>

                    </div>
                  )
                )
            )}

          </div>

        </div>

      </div>

    </div>
  );
}


// =========================================================
// ORDER DATE
// =========================================================

function getOrderDate(order) {
  if (order.date) {
    return parseFirebaseDate(
      order.date
    );
  }

  if (order.createdAt) {
    return parseFirebaseDate(
      order.createdAt
    );
  }

  return null;
}


// =========================================================
// STOCK DATE
// =========================================================

function getStockDate(item) {
  if (item.date) {
    return parseFirebaseDate(
      item.date
    );
  }

  if (item.createdAt) {
    return parseFirebaseDate(
      item.createdAt
    );
  }

  return null;
}


// =========================================================
// FIREBASE DATE PARSER
// =========================================================

function parseFirebaseDate(
  value
) {
  if (!value) {
    return null;
  }

  if (
    value?.toDate
  ) {
    return value.toDate();
  }

  if (
    value instanceof Date
  ) {
    return value;
  }

  const parsed =
    new Date(value);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return null;
  }

  return parsed;
}


// =========================================================
// DATE STRING
// =========================================================

function getOrderDateString(
  order
) {
  const date =
    getOrderDate(order);

  return date
    ? formatDate(date)
    : null;
}

function getStockDateString(
  item
) {
  const date =
    getStockDate(item);

  return date
    ? formatDate(date)
    : null;
}


// =========================================================
// CHART DATE
// =========================================================

function formatChartDate(
  date
) {
  const d =
    new Date(date);

  return d.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
    }
  );
}


// =========================================================
// PROGRESS
// =========================================================

function getProgress(
  value,
  max
) {
  if (!max) {
    return 0;
  }

  return Math.min(
    100,
    Math.round(
      (value / max) *
        100
    )
  );
}