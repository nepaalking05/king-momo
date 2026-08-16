import { useEffect, useMemo, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../services/firebase";
import "./dailyStock.css";

const initialForm = {
  type: "employee",

  employeeName: "",
  employeeId: "",

  category: "petrol",

  itemName: "",
  quantity: "",
  unit: "kg",

  amount: "",
  supplier: "",
  note: "",

  deductFromSalary: true,
};

const employees = [
  {
    id: "emp-1",
    name: "Yubraj",
  },
  {
    id: "emp-2",
    name: "Ursang",
  },
  {
    id: "emp-3",
    name: "Deepal",
  },
];

const employeeCategories = [
  {
    value: "petrol",
    label: "Petrol / Travel",
  },
  {
    value: "food",
    label: "Food",
  },
  {
    value: "miscellaneous",
    label: "Miscellaneous",
  },
  {
    value: "advance",
    label: "Advance",
  },
  {
    value: "other",
    label: "Other",
  },
];

const preparationCategories = [
  {
    value: "raw_material",
    label: "Raw Material",
  },
  {
    value: "vegetables",
    label: "Vegetables",
  },
  {
    value: "dairy",
    label: "Dairy",
  },
  {
    value: "spices",
    label: "Spices",
  },
  {
    value: "oil",
    label: "Oil",
  },
  {
    value: "other",
    label: "Other",
  },
];

const packagingCategories = [
  {
    value: "containers",
    label: "Containers",
  },
  {
    value: "bags",
    label: "Bags",
  },
  {
    value: "cups",
    label: "Cups",
  },
  {
    value: "cutlery",
    label: "Cutlery",
  },
  {
    value: "tissues",
    label: "Tissues",
  },
  {
    value: "other",
    label: "Other",
  },
];

const units = [
  "kg",
  "g",
  "litre",
  "ml",
  "pcs",
  "packet",
  "box",
  "dozen",
];

export default function DailyStocks() {
  const [items, setItems] = useState([]);

  const [activeFilter, setActiveFilter] =
    useState("all");

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] =
    useState(initialForm);

  /* =========================================
     TODAY
  ========================================= */

  const today = new Date()
    .toISOString()
    .split("T")[0];

  /* =========================================
     FIREBASE
  ========================================= */

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "dailyStock"),
      (snapshot) => {
        const data = snapshot.docs.map(
          (itemDoc) => ({
            id: itemDoc.id,
            ...itemDoc.data(),
          })
        );

        setItems(data);
      },
      (error) => {
        console.error(
          "Error loading expenses:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, []);

  /* =========================================
     TODAY ITEMS
  ========================================= */

  const todayItems = useMemo(() => {
    return items.filter(
      (item) => item.date === today
    );
  }, [items, today]);

  /* =========================================
     SUMMARY
  ========================================= */

  const summary = useMemo(() => {
    const employee = todayItems
      .filter(
        (item) =>
          item.type === "employee"
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      );

    const preparation = todayItems
      .filter(
        (item) =>
          item.type === "preparation"
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      );

    const packaging = todayItems
      .filter(
        (item) =>
          item.type === "packaging"
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      );

    const salaryDeduction =
      todayItems
        .filter(
          (item) =>
            item.type === "employee" &&
            item.deductFromSalary
        )
        .reduce(
          (sum, item) =>
            sum +
            Number(item.amount || 0),
          0
        );

    return {
      employee,
      preparation,
      packaging,
      salaryDeduction,
      total:
        employee +
        preparation +
        packaging,
    };
  }, [todayItems]);

  /* =========================================
     FILTERED ITEMS
  ========================================= */

  const filteredItems = useMemo(() => {
    let result = [...todayItems];

    if (activeFilter !== "all") {
      result = result.filter(
        (item) =>
          item.type === activeFilter
      );
    }

    const query =
      search.trim().toLowerCase();

    if (query) {
      result = result.filter(
        (item) => {
          return (
            item.itemName
              ?.toLowerCase()
              .includes(query) ||
            item.employeeName
              ?.toLowerCase()
              .includes(query) ||
            item.category
              ?.toLowerCase()
              .includes(query) ||
            item.supplier
              ?.toLowerCase()
              .includes(query) ||
            item.note
              ?.toLowerCase()
              .includes(query)
          );
        }
      );
    }

    return result;
  }, [
    todayItems,
    activeFilter,
    search,
  ]);

  /* =========================================
     FORM HELPERS
  ========================================= */

  const updateForm = (
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const changeType = (type) => {
    setForm({
      ...initialForm,
      type,
    });
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);

    setForm(initialForm);
  };

  /* =========================================
     CATEGORY OPTIONS
  ========================================= */

  const categoryOptions =
    form.type === "employee"
      ? employeeCategories
      : form.type === "preparation"
      ? preparationCategories
      : packagingCategories;

  /* =========================================
     SAVE
  ========================================= */

  const addEntry = async () => {
    if (
      form.type === "employee" &&
      !form.employeeName
    ) {
      alert("Select employee");
      return;
    }

    if (
      form.type !== "employee" &&
      !form.itemName.trim()
    ) {
      alert("Enter item name");
      return;
    }

    if (
      !form.amount ||
      Number(form.amount) < 0
    ) {
      alert("Enter a valid amount");
      return;
    }

    if (
      form.type !== "employee" &&
      (
        !form.quantity ||
        Number(form.quantity) <= 0
      )
    ) {
      alert("Enter a valid quantity");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        type: form.type,

        category:
          form.category,

        amount:
          Number(form.amount),

        note:
          form.note.trim(),

        date: today,

        createdAt:
          serverTimestamp(),
      };

      /* Employee */

      if (form.type === "employee") {
        payload.employeeId =
          form.employeeId;

        payload.employeeName =
          form.employeeName;

        payload.deductFromSalary =
          form.deductFromSalary;
      }

      /* Preparation / Packaging */

      if (
        form.type === "preparation" ||
        form.type === "packaging"
      ) {
        payload.itemName =
          form.itemName.trim();

        payload.quantity =
          Number(form.quantity);

        payload.unit =
          form.unit;

        payload.supplier =
          form.supplier.trim();
      }

      await addDoc(
        collection(db, "dailyStock"),
        payload
      );

      setForm(initialForm);

      setShowModal(false);
    } catch (error) {
      console.error(
        "Error adding entry:",
        error
      );

      alert(
        "Unable to save entry"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     FORMAT CATEGORY
  ========================================= */

  const getCategoryLabel = (
    item
  ) => {
    let options = [];

    if (item.type === "employee") {
      options =
        employeeCategories;
    }

    if (item.type === "preparation") {
      options =
        preparationCategories;
    }

    if (item.type === "packaging") {
      options =
        packagingCategories;
    }

    return (
      options.find(
        (category) =>
          category.value ===
          item.category
      )?.label ||
      item.category
    );
  };

  /* =========================================
     TYPE LABEL
  ========================================= */

  const getTypeLabel = (
    type
  ) => {
    if (type === "employee")
      return "Employee Expense";

    if (type === "preparation")
      return "Preparation";

    if (type === "packaging")
      return "Packaging";

    return type;
  };

  return (
    <div className="daily-stock-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="daily-stock-header">

        <div>
          <h2>
            Expenses & Purchases
          </h2>

          <p>
            Manage today's expenses,
            stock purchases and
            employee deductions
          </p>
        </div>

        <button
          className="add-entry-btn"
          onClick={() =>
            setShowModal(true)
          }
        >
          <span>+</span>
          Add Entry
        </button>

      </div>

      {/* =====================================
          SUMMARY
      ===================================== */}

      <div className="expense-summary">

        <div className="expense-summary-main">
          <span>
            Today's Total
          </span>

          <strong>
            ₹{summary.total}
          </strong>

          <small>
            {todayItems.length} entries
          </small>
        </div>

        <div className="expense-summary-item">
          <span>
            Employee
          </span>

          <strong>
            ₹{summary.employee}
          </strong>
        </div>

        <div className="expense-summary-item">
          <span>
            Preparation
          </span>

          <strong>
            ₹{summary.preparation}
          </strong>
        </div>

        <div className="expense-summary-item">
          <span>
            Packaging
          </span>

          <strong>
            ₹{summary.packaging}
          </strong>
        </div>

        <div className="expense-summary-item deduction">
          <span>
            Salary Deduction
          </span>

          <strong>
            ₹{summary.salaryDeduction}
          </strong>
        </div>

      </div>

      {/* =====================================
          FILTERS
      ===================================== */}

      <div className="stock-toolbar">

        <div className="stock-filters">

          <button
            className={
              activeFilter === "all"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveFilter("all")
            }
          >
            All
          </button>

          <button
            className={
              activeFilter === "employee"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveFilter(
                "employee"
              )
            }
          >
            Employee
          </button>

          <button
            className={
              activeFilter ===
              "preparation"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveFilter(
                "preparation"
              )
            }
          >
            Preparation
          </button>

          <button
            className={
              activeFilter === "packaging"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveFilter(
                "packaging"
              )
            }
          >
            Packaging
          </button>

        </div>

        <div className="stock-search">

          <span>
            ⌕
          </span>

          <input
            placeholder="Search..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>

      </div>

      {/* =====================================
          LIST
      ===================================== */}

      <div className="daily-stock-list">

        {filteredItems.length === 0 ? (
          <div className="empty-stock">

            <div className="empty-stock-icon">
              ₹
            </div>

            <h3>
              No entries found
            </h3>

            <p>
              Add an employee expense
              or purchase to get started.
            </p>

            <button
              onClick={() =>
                setShowModal(true)
              }
            >
              + Add Entry
            </button>

          </div>
        ) : (
          filteredItems.map(
            (item) => (
              <div
                key={item.id}
                className={`expense-card ${item.type}`}
              >

                {/* LEFT */}

                <div className="expense-card-main">

                  <div className="expense-card-title">

                    <h4>
                      {item.type ===
                      "employee"
                        ? item.employeeName
                        : item.itemName}
                    </h4>

                    <span
                      className={`type-badge ${item.type}`}
                    >
                      {getTypeLabel(
                        item.type
                      )}
                    </span>

                  </div>

                  <div className="expense-card-meta">

                    <span>
                      {getCategoryLabel(
                        item
                      )}
                    </span>

                    {item.type !==
                      "employee" && (
                      <>
                        <span>
                          •
                        </span>

                        <span>
                          {item.quantity}{" "}
                          {item.unit}
                        </span>
                      </>
                    )}

                    {item.supplier && (
                      <>
                        <span>
                          •
                        </span>

                        <span>
                          {item.supplier}
                        </span>
                      </>
                    )}

                  </div>

                  {item.note && (
                    <div className="expense-note">
                      {item.note}
                    </div>
                  )}

                  {item.type ===
                    "employee" &&
                    item.deductFromSalary && (
                      <span className="salary-deduction-badge">
                        ✓ Deduct from salary
                      </span>
                    )}

                </div>

                {/* RIGHT */}

                <div className="expense-card-amount">
                  <strong>
                    ₹{item.amount}
                  </strong>
                </div>

              </div>
            )
          )
        )}

      </div>

      {/* =====================================
          ADD MODAL
      ===================================== */}

      {showModal && (
        <div
          className="daily-stock-overlay"
          onClick={closeModal}
        >

          <div
            className="daily-stock-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>
                <h3>
                  Add Entry
                </h3>

                <p>
                  Record expense or
                  purchase
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            {/* TYPE */}

            <div className="entry-type-selector">

              <button
                className={
                  form.type ===
                  "employee"
                    ? "active employee"
                    : ""
                }
                onClick={() =>
                  changeType(
                    "employee"
                  )
                }
              >
                <span>
                  👤
                </span>

                Employee
              </button>

              <button
                className={
                  form.type ===
                  "preparation"
                    ? "active preparation"
                    : ""
                }
                onClick={() =>
                  changeType(
                    "preparation"
                  )
                }
              >
                <span>
                  🥬
                </span>

                Preparation
              </button>

              <button
                className={
                  form.type ===
                  "packaging"
                    ? "active packaging"
                    : ""
                }
                onClick={() =>
                  changeType(
                    "packaging"
                  )
                }
              >
                <span>
                  📦
                </span>

                Packaging
              </button>

            </div>

            {/* =================================
                EMPLOYEE FORM
            ================================= */}

            {form.type ===
              "employee" && (
              <>

                <div className="form-group">

                  <label>
                    Employee
                  </label>

                  <select
                    value={
                      form.employeeId
                    }
                    onChange={(e) => {
                      const employee =
                        employees.find(
                          (item) =>
                            item.id ===
                            e.target.value
                        );

                      updateForm(
                        "employeeId",
                        employee?.id || ""
                      );

                      updateForm(
                        "employeeName",
                        employee?.name ||
                          ""
                      );
                    }}
                  >
                    <option value="">
                      Select Employee
                    </option>

                    {employees.map(
                      (employee) => (
                        <option
                          key={
                            employee.id
                          }
                          value={
                            employee.id
                          }
                        >
                          {employee.name}
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div className="form-row">

                  <div className="form-group">

                    <label>
                      Expense Type
                    </label>

                    <select
                      value={
                        form.category
                      }
                      onChange={(e) =>
                        updateForm(
                          "category",
                          e.target.value
                        )
                      }
                    >
                      {employeeCategories.map(
                        (category) => (
                          <option
                            key={
                              category.value
                            }
                            value={
                              category.value
                            }
                          >
                            {
                              category.label
                            }
                          </option>
                        )
                      )}
                    </select>

                  </div>

                  <div className="form-group">

                    <label>
                      Amount
                    </label>

                    <div className="amount-input">

                      <span>
                        ₹
                      </span>

                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={
                          form.amount
                        }
                        onChange={(e) =>
                          updateForm(
                            "amount",
                            e.target.value
                          )
                        }
                      />

                    </div>

                  </div>

                </div>

                <div className="form-group">

                  <label>
                    Note
                  </label>

                  <input
                    placeholder="e.g. Travel to supplier"
                    value={
                      form.note
                    }
                    onChange={(e) =>
                      updateForm(
                        "note",
                        e.target.value
                      )
                    }
                  />

                </div>

                <label className="salary-toggle">

                  <input
                    type="checkbox"
                    checked={
                      form.deductFromSalary
                    }
                    onChange={(e) =>
                      updateForm(
                        "deductFromSalary",
                        e.target.checked
                      )
                    }
                  />

                  <span>
                    <strong>
                      Deduct from salary
                    </strong>

                    <small>
                      Include this expense
                      in employee salary
                      deduction
                    </small>
                  </span>

                </label>

              </>
            )}

            {/* =================================
                PURCHASE FORM
            ================================= */}

            {(
              form.type ===
                "preparation" ||
              form.type ===
                "packaging"
            ) && (
              <>

                <div className="form-group">

                  <label>
                    Item
                  </label>

                  <input
                    placeholder={
                      form.type ===
                      "preparation"
                        ? "e.g. Paneer, Rice, Oil"
                        : "e.g. Food Container, Bag"
                    }
                    value={
                      form.itemName
                    }
                    onChange={(e) =>
                      updateForm(
                        "itemName",
                        e.target.value
                      )
                    }
                  />

                </div>

                <div className="form-row">

                  <div className="form-group">

                    <label>
                      Category
                    </label>

                    <select
                      value={
                        form.category
                      }
                      onChange={(e) =>
                        updateForm(
                          "category",
                          e.target.value
                        )
                      }
                    >
                      {categoryOptions.map(
                        (category) => (
                          <option
                            key={
                              category.value
                            }
                            value={
                              category.value
                            }
                          >
                            {
                              category.label
                            }
                          </option>
                        )
                      )}
                    </select>

                  </div>

                  <div className="form-group">

                    <label>
                      Quantity
                    </label>

                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={
                        form.quantity
                      }
                      onChange={(e) =>
                        updateForm(
                          "quantity",
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>

                <div className="form-row">

                  <div className="form-group">

                    <label>
                      Unit
                    </label>

                    <select
                      value={
                        form.unit
                      }
                      onChange={(e) =>
                        updateForm(
                          "unit",
                          e.target.value
                        )
                      }
                    >
                      {units.map(
                        (unit) => (
                          <option
                            key={unit}
                            value={unit}
                          >
                            {unit}
                          </option>
                        )
                      )}
                    </select>

                  </div>

                  <div className="form-group">

                    <label>
                      Total Cost
                    </label>

                    <div className="amount-input">

                      <span>
                        ₹
                      </span>

                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={
                          form.amount
                        }
                        onChange={(e) =>
                          updateForm(
                            "amount",
                            e.target.value
                          )
                        }
                      />

                    </div>

                  </div>

                </div>

                <div className="form-group">

                  <label>
                    Supplier
                  </label>

                  <input
                    placeholder="Optional"
                    value={
                      form.supplier
                    }
                    onChange={(e) =>
                      updateForm(
                        "supplier",
                        e.target.value
                      )
                    }
                  />

                </div>

                <div className="form-group">

                  <label>
                    Note
                  </label>

                  <input
                    placeholder="Optional"
                    value={
                      form.note
                    }
                    onChange={(e) =>
                      updateForm(
                        "note",
                        e.target.value
                      )
                    }
                  />

                </div>

              </>
            )}

            {/* =================================
                ACTIONS
            ================================= */}

            <div className="modal-actions">

              <button
                className="cancel-btn"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="save-entry-btn"
                onClick={addEntry}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Entry"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}