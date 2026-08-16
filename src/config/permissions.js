export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
};


export const NAVIGATION = [
  {
    label: "Dashboard",
    path: "/dashboard",
    roles: [
      ROLES.ADMIN,
      ROLES.MANAGER,
    ],
  },

  {
    label: "POS",
    path: "/pos",
    roles: [
      ROLES.ADMIN,
      ROLES.MANAGER,
    ],
  },

  {
    label: "Orders",
    path: "/orders",
    roles: [
      ROLES.ADMIN,
      ROLES.MANAGER,
    ],
  },

  {
    label: "Inventory",
    path: "/inventory",
    roles: [
      ROLES.ADMIN,
      ROLES.MANAGER,
    ],
  },

  {
    label: "Daily Stock",
    path: "/daily-stock",
    roles: [
      ROLES.ADMIN,
      ROLES.MANAGER,
    ],
  },

  {
    label: "Employees",
    path: "/employees",
    roles: [
      ROLES.ADMIN,
    ],
  },

  {
    label: "Settings",
    path: "/settings",
    roles: [
      ROLES.ADMIN,
    ],
  },
];