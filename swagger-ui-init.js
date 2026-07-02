
window.onload = function() {
  // Build a system
  var url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  var options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "info": {
      "title": "BACK-END-WHATSAPP-PRO API",
      "version": "1.0.0",
      "description": "AI-powered multi-tenant B2B commerce platform API"
    },
    "servers": [
      {
        "url": "https://back-end-whatsapp-pro.onrender.com/api/v1",
        "description": "Production (Render)"
      },
      {
        "url": "http://localhost:4000/api/v1",
        "description": "Local"
      }
    ],
    "components": {
      "securitySchemes": {
        "bearerAuth": {
          "type": "http",
          "scheme": "bearer",
          "bearerFormat": "JWT"
        }
      }
    },
    "security": [
      {
        "bearerAuth": []
      }
    ],
    "paths": {
      "/auth/register": {
        "post": {
          "summary": "Register a new tenant + first user",
          "description": "Creates a tenant and owner account. Returns access + refresh tokens immediately.",
          "tags": [
            "Auth"
          ],
          "security": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "email",
                    "password",
                    "tenantName"
                  ],
                  "properties": {
                    "email": {
                      "type": "string",
                      "format": "email",
                      "example": "test@example.com"
                    },
                    "password": {
                      "type": "string",
                      "minLength": 8,
                      "example": "password123"
                    },
                    "name": {
                      "type": "string",
                      "example": "Test User"
                    },
                    "tenantName": {
                      "type": "string",
                      "example": "Acme Corp"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Registration successful — tokens issued",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "accessToken": {
                            "type": "string"
                          },
                          "refreshToken": {
                            "type": "string"
                          },
                          "user": {
                            "type": "object",
                            "properties": {
                              "id": {
                                "type": "string"
                              },
                              "email": {
                                "type": "string"
                              },
                              "name": {
                                "type": "string"
                              },
                              "tenantId": {
                                "type": "string"
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Email already in use or invalid payload"
            }
          }
        }
      },
      "/auth/login": {
        "post": {
          "summary": "Login with email + password — returns tokens",
          "tags": [
            "Auth"
          ],
          "security": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "email",
                    "password"
                  ],
                  "properties": {
                    "email": {
                      "type": "string",
                      "format": "email",
                      "example": "test@example.com"
                    },
                    "password": {
                      "type": "string",
                      "example": "password123"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Login successful — tokens issued",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "accessToken": {
                            "type": "string"
                          },
                          "refreshToken": {
                            "type": "string"
                          },
                          "user": {
                            "type": "object",
                            "properties": {
                              "id": {
                                "type": "string"
                              },
                              "email": {
                                "type": "string"
                              },
                              "name": {
                                "type": "string"
                              },
                              "tenantId": {
                                "type": "string"
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Invalid credentials or banned account"
            }
          }
        }
      },
      "/auth/refresh": {
        "post": {
          "summary": "Exchange a refresh token for a new access token",
          "description": "Issues a new access token. Returns 401 if the session has been inactive for more than 10 minutes — the user must re-authenticate via /auth/login.",
          "tags": [
            "Auth"
          ],
          "security": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "refreshToken"
                  ],
                  "properties": {
                    "refreshToken": {
                      "type": "string",
                      "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "New access token issued",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "accessToken": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Invalid/expired refresh token or session expired due to inactivity"
            }
          }
        }
      },
      "/auth/logout": {
        "post": {
          "summary": "Logout — invalidates the refresh token",
          "tags": [
            "Auth"
          ],
          "security": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "refreshToken"
                  ],
                  "properties": {
                    "refreshToken": {
                      "type": "string",
                      "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Logged out successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "message": {
                            "type": "string",
                            "example": "Logged out successfully"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/auth/forgot-password": {
        "post": {
          "summary": "Request a password reset email",
          "tags": [
            "Auth"
          ],
          "security": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "email"
                  ],
                  "properties": {
                    "email": {
                      "type": "string",
                      "format": "email"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Reset email dispatched (response is identical whether the email exists or not)",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "message": {
                            "type": "string",
                            "example": "If that email exists, a reset link has been sent"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/auth/reset-password": {
        "post": {
          "summary": "Reset password using a token from email",
          "tags": [
            "Auth"
          ],
          "security": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "token",
                    "password"
                  ],
                  "properties": {
                    "token": {
                      "type": "string"
                    },
                    "password": {
                      "type": "string",
                      "minLength": 8,
                      "example": "newpassword123"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Password reset successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "message": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid, expired, or already-used reset token"
            }
          }
        }
      },
      "/users": {
        "get": {
          "summary": "List users in the current tenant",
          "tags": [
            "Users"
          ],
          "parameters": [
            {
              "in": "query",
              "name": "page",
              "schema": {
                "type": "integer",
                "default": 1
              }
            },
            {
              "in": "query",
              "name": "limit",
              "schema": {
                "type": "integer",
                "default": 20,
                "maximum": 100
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Paginated list of users",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string"
                            },
                            "email": {
                              "type": "string"
                            },
                            "name": {
                              "type": "string",
                              "nullable": true
                            },
                            "roleId": {
                              "type": "string",
                              "nullable": true
                            },
                            "isBanned": {
                              "type": "boolean"
                            },
                            "createdAt": {
                              "type": "string",
                              "format": "date-time"
                            }
                          }
                        }
                      },
                      "meta": {
                        "type": "object",
                        "properties": {
                          "page": {
                            "type": "integer"
                          },
                          "limit": {
                            "type": "integer"
                          },
                          "total": {
                            "type": "integer"
                          },
                          "totalPages": {
                            "type": "integer"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        },
        "post": {
          "summary": "Create a new user in the current tenant",
          "tags": [
            "Users"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "email",
                    "password"
                  ],
                  "properties": {
                    "email": {
                      "type": "string",
                      "format": "email",
                      "example": "user@example.com"
                    },
                    "password": {
                      "type": "string",
                      "minLength": 8,
                      "example": "secret123"
                    },
                    "name": {
                      "type": "string",
                      "example": "Jane Doe"
                    },
                    "roleId": {
                      "type": "string",
                      "format": "uuid",
                      "nullable": true
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "User created",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string"
                          },
                          "email": {
                            "type": "string"
                          },
                          "name": {
                            "type": "string",
                            "nullable": true
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Email already in use or invalid roleId"
            }
          }
        }
      },
      "/users/{id}": {
        "get": {
          "summary": "Get a single user",
          "tags": [
            "Users"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "User object",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string"
                          },
                          "email": {
                            "type": "string"
                          },
                          "name": {
                            "type": "string",
                            "nullable": true
                          },
                          "roleId": {
                            "type": "string",
                            "nullable": true
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid UUID"
            },
            "404": {
              "description": "User not found"
            }
          }
        },
        "patch": {
          "summary": "Update a user",
          "tags": [
            "Users"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "example": "Updated Name"
                    },
                    "roleId": {
                      "type": "string",
                      "format": "uuid",
                      "nullable": true
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "User updated"
            },
            "400": {
              "description": "Invalid UUID or invalid roleId"
            },
            "404": {
              "description": "User not found"
            }
          }
        },
        "delete": {
          "summary": "Delete a user",
          "tags": [
            "Users"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "User deleted"
            },
            "400": {
              "description": "Invalid UUID"
            },
            "404": {
              "description": "User not found"
            }
          }
        }
      },
      "/rbac/roles": {
        "get": {
          "summary": "List all roles for the current tenant",
          "tags": [
            "RBAC"
          ],
          "responses": {
            "200": {
              "description": "Array of roles",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string"
                            },
                            "name": {
                              "type": "string"
                            },
                            "permissions": {
                              "type": "array",
                              "items": {
                                "type": "string"
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        },
        "post": {
          "summary": "Create a new role",
          "tags": [
            "RBAC"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "name"
                  ],
                  "properties": {
                    "name": {
                      "type": "string",
                      "minLength": 2,
                      "example": "manager"
                    },
                    "permissions": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "example": []
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Role created"
            },
            "400": {
              "description": "Role name already exists or invalid permissions"
            }
          }
        }
      },
      "/rbac/roles/{id}": {
        "get": {
          "summary": "Get a single role",
          "tags": [
            "RBAC"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Role object"
            },
            "400": {
              "description": "Invalid UUID"
            },
            "404": {
              "description": "Role not found"
            }
          }
        },
        "patch": {
          "summary": "Update a role",
          "tags": [
            "RBAC"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "minLength": 2
                    },
                    "permissions": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Role updated"
            },
            "400": {
              "description": "Role name conflict or invalid UUID"
            },
            "404": {
              "description": "Role not found"
            }
          }
        },
        "delete": {
          "summary": "Delete a role (unassigns it from all users first)",
          "tags": [
            "RBAC"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "Role deleted"
            },
            "400": {
              "description": "Invalid UUID"
            },
            "404": {
              "description": "Role not found"
            }
          }
        }
      },
      "/rbac/users/{userId}/role": {
        "patch": {
          "summary": "Assign or unassign a role to a user",
          "tags": [
            "RBAC"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "userId",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "roleId"
                  ],
                  "properties": {
                    "roleId": {
                      "type": "string",
                      "format": "uuid",
                      "nullable": true,
                      "description": "Pass null to unassign the current role"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Role assigned",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string"
                          },
                          "email": {
                            "type": "string"
                          },
                          "roleId": {
                            "type": "string",
                            "nullable": true
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid roleId"
            },
            "404": {
              "description": "User not found"
            }
          }
        }
      },
      "/tenant/me": {
        "get": {
          "summary": "Get the authenticated user's own tenant profile",
          "tags": [
            "Tenants"
          ],
          "responses": {
            "200": {
              "description": "Tenant profile",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string"
                          },
                          "name": {
                            "type": "string"
                          },
                          "slug": {
                            "type": "string"
                          },
                          "domain": {
                            "type": "string",
                            "nullable": true
                          },
                          "status": {
                            "type": "string",
                            "enum": [
                              "ACTIVE",
                              "SUSPENDED",
                              "CANCELLED"
                            ]
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        },
        "patch": {
          "summary": "Update the authenticated user's own tenant profile",
          "tags": [
            "Tenants"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "minLength": 2
                    },
                    "domain": {
                      "type": "string",
                      "nullable": true
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Tenant updated"
            },
            "400": {
              "description": "Validation error or domain already in use"
            }
          }
        }
      },
      "/tenant": {
        "get": {
          "summary": "List all tenants (super admin only)",
          "tags": [
            "Tenants"
          ],
          "parameters": [
            {
              "in": "query",
              "name": "page",
              "schema": {
                "type": "integer",
                "default": 1
              }
            },
            {
              "in": "query",
              "name": "limit",
              "schema": {
                "type": "integer",
                "default": 20
              }
            },
            {
              "in": "query",
              "name": "status",
              "schema": {
                "type": "string",
                "enum": [
                  "ACTIVE",
                  "SUSPENDED",
                  "CANCELLED"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Paginated list of tenants"
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "Forbidden — super admin only"
            }
          }
        }
      },
      "/tenant/{id}": {
        "get": {
          "summary": "Get any tenant by ID (super admin only)",
          "tags": [
            "Tenants"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Tenant details"
            },
            "403": {
              "description": "Forbidden — super admin only"
            },
            "404": {
              "description": "Tenant not found"
            }
          }
        },
        "patch": {
          "summary": "Update any tenant (super admin only)",
          "tags": [
            "Tenants"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string"
                    },
                    "domain": {
                      "type": "string",
                      "nullable": true
                    },
                    "status": {
                      "type": "string",
                      "enum": [
                        "ACTIVE",
                        "SUSPENDED",
                        "CANCELLED"
                      ]
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Tenant updated"
            },
            "403": {
              "description": "Forbidden — super admin only"
            },
            "404": {
              "description": "Tenant not found"
            }
          }
        },
        "delete": {
          "summary": "Delete a tenant and all its data (super admin only)",
          "tags": [
            "Tenants"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "Tenant deleted"
            },
            "403": {
              "description": "Forbidden — super admin only"
            },
            "404": {
              "description": "Tenant not found"
            }
          }
        }
      },
      "/billing/initialize": {
        "post": {
          "summary": "Initialize a Monnify checkout for a subscription plan",
          "tags": [
            "Billing"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "planId"
                  ],
                  "properties": {
                    "planId": {
                      "type": "string",
                      "format": "uuid"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Checkout URL and reference"
            },
            "400": {
              "description": "Invalid plan or Monnify error"
            }
          }
        }
      },
      "/billing/plans/upsert": {
        "post": {
          "summary": "Super admin — create or update a billing plan",
          "tags": [
            "Billing"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "name",
                    "label",
                    "priceMinor",
                    "intervalDays"
                  ],
                  "properties": {
                    "name": {
                      "type": "string",
                      "description": "Unique machine-readable key (e.g. \"monthly\")",
                      "example": "monthly"
                    },
                    "label": {
                      "type": "string",
                      "description": "Human-readable display name",
                      "example": "Monthly Plan"
                    },
                    "priceMinor": {
                      "type": "integer",
                      "description": "Price in kobo (NGN minor units)",
                      "example": 500000
                    },
                    "currency": {
                      "type": "string",
                      "default": "NGN",
                      "example": "NGN"
                    },
                    "intervalDays": {
                      "type": "integer",
                      "description": "Billing cycle in days (30 = monthly, 365 = yearly)",
                      "example": 30
                    },
                    "isActive": {
                      "type": "boolean",
                      "default": true
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Plan created or updated"
            },
            "400": {
              "description": "Validation error"
            },
            "403": {
              "description": "Super admin only"
            }
          }
        }
      },
      "/billing/plans": {
        "get": {
          "summary": "Get all active billing plans",
          "tags": [
            "Billing"
          ],
          "security": [],
          "responses": {
            "200": {
              "description": "List of active plans"
            }
          }
        }
      },
      "/billing/webhook": {
        "post": {
          "summary": "Monnify payment webhook — signature verified internally",
          "tags": [
            "Billing"
          ],
          "security": [],
          "responses": {
            "200": {
              "description": "Webhook processed"
            },
            "400": {
              "description": "Invalid signature or unknown event"
            }
          }
        }
      },
      "/admin/stats": {
        "get": {
          "summary": "Platform-wide stats",
          "tags": [
            "SuperAdmin"
          ],
          "responses": {
            "200": {
              "description": "Platform stats",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "totalTenants": {
                            "type": "integer"
                          },
                          "activeTenants": {
                            "type": "integer"
                          },
                          "suspendedTenants": {
                            "type": "integer"
                          },
                          "totalUsers": {
                            "type": "integer"
                          },
                          "totalOrders": {
                            "type": "integer"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "403": {
              "description": "Super admin only"
            }
          }
        }
      },
      "/admin/tenants/{id}/suspend": {
        "patch": {
          "summary": "Suspend a tenant",
          "tags": [
            "SuperAdmin"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Tenant suspended"
            },
            "400": {
              "description": "Tenant is already suspended"
            },
            "403": {
              "description": "Super admin only"
            },
            "404": {
              "description": "Tenant not found"
            }
          }
        }
      },
      "/admin/tenants/{id}/activate": {
        "patch": {
          "summary": "Activate a suspended tenant",
          "tags": [
            "SuperAdmin"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Tenant activated"
            },
            "400": {
              "description": "Tenant is already active"
            },
            "403": {
              "description": "Super admin only"
            },
            "404": {
              "description": "Tenant not found"
            }
          }
        }
      },
      "/admin/tenants/{id}/plan": {
        "patch": {
          "summary": "Manually override a tenant's subscription plan",
          "tags": [
            "SuperAdmin"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "planId": {
                      "type": "string",
                      "format": "uuid",
                      "description": "BillingPlan ID to assign"
                    },
                    "status": {
                      "type": "string",
                      "enum": [
                        "TRIAL",
                        "ACTIVE",
                        "EXPIRED",
                        "CANCELLED"
                      ]
                    },
                    "renewsAt": {
                      "type": "string",
                      "format": "date-time"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Subscription updated"
            },
            "400": {
              "description": "Invalid plan ID or status"
            },
            "403": {
              "description": "Super admin only"
            },
            "404": {
              "description": "Tenant not found"
            }
          }
        }
      },
      "/admin/tenants/{tenantId}/users": {
        "get": {
          "summary": "List all users in a tenant",
          "tags": [
            "SuperAdmin"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "tenantId",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "List of users in the tenant",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string"
                            },
                            "email": {
                              "type": "string"
                            },
                            "name": {
                              "type": "string",
                              "nullable": true
                            },
                            "isBanned": {
                              "type": "boolean"
                            },
                            "roleId": {
                              "type": "string",
                              "nullable": true
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "403": {
              "description": "Super admin only"
            },
            "404": {
              "description": "Tenant not found"
            }
          }
        }
      },
      "/admin/users/{userId}/ban": {
        "patch": {
          "summary": "Ban a user",
          "tags": [
            "SuperAdmin"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "userId",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "User banned"
            },
            "400": {
              "description": "User is already banned or is a super admin"
            },
            "403": {
              "description": "Super admin only"
            },
            "404": {
              "description": "User not found"
            }
          }
        }
      },
      "/admin/users/{userId}/unban": {
        "patch": {
          "summary": "Unban a user",
          "tags": [
            "SuperAdmin"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "userId",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "User unbanned"
            },
            "400": {
              "description": "User is not banned"
            },
            "403": {
              "description": "Super admin only"
            },
            "404": {
              "description": "User not found"
            }
          }
        }
      },
      "/admin/users/{userId}/role": {
        "patch": {
          "summary": "Assign a role to a user",
          "tags": [
            "SuperAdmin"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "userId",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "roleId"
                  ],
                  "properties": {
                    "roleId": {
                      "type": "string",
                      "format": "uuid"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Role assigned"
            },
            "400": {
              "description": "Cannot assign role to a super admin"
            },
            "403": {
              "description": "Super admin only"
            },
            "404": {
              "description": "User or role not found"
            }
          }
        }
      },
      "/admin/admins": {
        "get": {
          "summary": "List all super admins",
          "tags": [
            "SuperAdmin"
          ],
          "responses": {
            "200": {
              "description": "List of super admins",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string"
                            },
                            "email": {
                              "type": "string"
                            },
                            "name": {
                              "type": "string",
                              "nullable": true
                            },
                            "createdAt": {
                              "type": "string",
                              "format": "date-time"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "403": {
              "description": "Super admin only"
            }
          }
        },
        "post": {
          "summary": "Create a new super admin",
          "tags": [
            "SuperAdmin"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "email",
                    "password"
                  ],
                  "properties": {
                    "email": {
                      "type": "string",
                      "format": "email",
                      "example": "admin@platform.com"
                    },
                    "password": {
                      "type": "string",
                      "minLength": 8,
                      "example": "securepassword"
                    },
                    "name": {
                      "type": "string",
                      "example": "Platform Admin"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Super admin created",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string"
                          },
                          "email": {
                            "type": "string"
                          },
                          "name": {
                            "type": "string",
                            "nullable": true
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Email already in use"
            },
            "403": {
              "description": "Super admin only"
            }
          }
        }
      },
      "/admin/admins/{id}": {
        "delete": {
          "summary": "Delete a super admin (cannot delete yourself)",
          "tags": [
            "SuperAdmin"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "Super admin deleted"
            },
            "400": {
              "description": "Cannot delete your own account or invalid UUID"
            },
            "403": {
              "description": "Super admin only"
            },
            "404": {
              "description": "Super admin not found"
            }
          }
        }
      },
      "/ai/chat": {
        "post": {
          "tags": [
            "AI"
          ],
          "summary": "Send a customer message through the AI agent (tool-calling loop)",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "conversationId",
                    "message"
                  ],
                  "properties": {
                    "conversationId": {
                      "type": "string"
                    },
                    "customerId": {
                      "type": "string"
                    },
                    "message": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "AI reply"
            }
          }
        }
      },
      "/ai/memory/{conversationId}": {
        "delete": {
          "tags": [
            "AI"
          ],
          "summary": "Clear the short-term memory for a conversation",
          "parameters": [
            {
              "in": "path",
              "name": "conversationId",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Memory cleared"
            }
          }
        }
      },
      "/knowledge/upload": {
        "post": {
          "tags": [
            "Knowledge"
          ],
          "summary": "Upload a document into the knowledge base (RAG ingest)",
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "file": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Document ingested"
            }
          }
        }
      },
      "/knowledge/search": {
        "get": {
          "tags": [
            "Knowledge"
          ],
          "summary": "Semantic search over the knowledge base",
          "parameters": [
            {
              "in": "query",
              "name": "q",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "in": "query",
              "name": "topK",
              "schema": {
                "type": "integer",
                "default": 5
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Matching chunks"
            }
          }
        }
      },
      "/knowledge/documents": {
        "get": {
          "tags": [
            "Knowledge"
          ],
          "summary": "List uploaded documents for the tenant",
          "responses": {
            "200": {
              "description": "Document list"
            }
          }
        }
      },
      "/business/categories": {
        "get": {
          "tags": [
            "Business"
          ],
          "summary": "List supported business categories",
          "responses": {
            "200": {
              "description": "Business category options"
            }
          }
        }
      },
      "/business": {
        "get": {
          "tags": [
            "Business"
          ],
          "summary": "Get the business profile for the current tenant",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Business profile"
            },
            "401": {
              "description": "Unauthorized"
            },
            "404": {
              "description": "Not found"
            }
          }
        },
        "post": {
          "tags": [
            "Business"
          ],
          "summary": "Create business profile (one per tenant)",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "displayName"
                  ],
                  "properties": {
                    "displayName": {
                      "type": "string"
                    },
                    "category": {
                      "type": "string",
                      "enum": [
                        "fashion",
                        "beauty",
                        "food",
                        "electronics",
                        "home",
                        "health",
                        "services",
                        "others"
                      ]
                    },
                    "categoryOther": {
                      "type": "string"
                    },
                    "tagline": {
                      "type": "string"
                    },
                    "description": {
                      "type": "string"
                    },
                    "email": {
                      "type": "string",
                      "format": "email"
                    },
                    "whatsappNumber": {
                      "type": "string"
                    },
                    "logoUrl": {
                      "type": "string",
                      "format": "uri"
                    },
                    "settings": {
                      "type": "object"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Business profile created"
            },
            "400": {
              "description": "Profile already exists"
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        },
        "put": {
          "tags": [
            "Business"
          ],
          "summary": "Update business profile",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "displayName": {
                      "type": "string"
                    },
                    "category": {
                      "type": "string",
                      "enum": [
                        "fashion",
                        "beauty",
                        "food",
                        "electronics",
                        "home",
                        "health",
                        "services",
                        "others"
                      ]
                    },
                    "categoryOther": {
                      "type": "string"
                    },
                    "tagline": {
                      "type": "string"
                    },
                    "description": {
                      "type": "string"
                    },
                    "email": {
                      "type": "string",
                      "format": "email"
                    },
                    "whatsappNumber": {
                      "type": "string"
                    },
                    "logoUrl": {
                      "type": "string",
                      "format": "uri"
                    },
                    "settings": {
                      "type": "object"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Updated business profile"
            },
            "401": {
              "description": "Unauthorized"
            },
            "404": {
              "description": "Profile not found"
            }
          }
        }
      },
      "/business/logo": {
        "post": {
          "tags": [
            "Business"
          ],
          "summary": "Upload or replace the business logo",
          "description": "Upload a logo image (jpeg/png/webp/gif, max 5MB). Returns the updated business profile.",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "image"
                  ],
                  "properties": {
                    "image": {
                      "type": "string",
                      "format": "binary",
                      "description": "Logo image"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Updated business profile"
            },
            "400": {
              "description": "No file or unsupported file type"
            },
            "401": {
              "description": "Unauthorized"
            },
            "404": {
              "description": "Business profile not found"
            }
          }
        }
      },
      "/products/categories": {
        "get": {
          "tags": [
            "Products"
          ],
          "summary": "List supported product categories",
          "responses": {
            "200": {
              "description": "Product category options"
            }
          }
        }
      },
      "/products": {
        "get": {
          "tags": [
            "Products"
          ],
          "summary": "List products for the tenant",
          "parameters": [
            {
              "in": "query",
              "name": "q",
              "schema": {
                "type": "string"
              },
              "description": "Search by name"
            },
            {
              "in": "query",
              "name": "category",
              "schema": {
                "type": "string",
                "enum": [
                  "best-selling",
                  "new-arrival",
                  "featured",
                  "discount",
                  "regular",
                  "others"
                ]
              },
              "description": "Filter by product category"
            },
            {
              "in": "query",
              "name": "page",
              "schema": {
                "type": "integer",
                "default": 1
              }
            },
            {
              "in": "query",
              "name": "limit",
              "schema": {
                "type": "integer",
                "default": 20
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Paginated product list"
            }
          }
        },
        "post": {
          "tags": [
            "Products"
          ],
          "summary": "Create a new product",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "name"
                  ],
                  "properties": {
                    "name": {
                      "type": "string"
                    },
                    "category": {
                      "type": "string",
                      "enum": [
                        "best-selling",
                        "new-arrival",
                        "featured",
                        "discount",
                        "regular",
                        "others"
                      ]
                    },
                    "description": {
                      "type": "string"
                    },
                    "review": {
                      "type": "string"
                    },
                    "imageUrl": {
                      "type": "string",
                      "format": "uri"
                    },
                    "price": {
                      "type": "number",
                      "description": "Decimal price; converted to minor units when priceMinor is omitted"
                    },
                    "priceMinor": {
                      "type": "integer",
                      "description": "Price in minor currency units (kobo/cents)"
                    },
                    "currency": {
                      "type": "string",
                      "default": "NGN"
                    },
                    "attributes": {
                      "type": "object"
                    },
                    "stock": {
                      "type": "integer",
                      "default": 0
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Product created"
            }
          }
        }
      },
      "/products/{id}": {
        "get": {
          "tags": [
            "Products"
          ],
          "summary": "Get a product by ID",
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Product"
            },
            "404": {
              "description": "Not found"
            }
          }
        },
        "put": {
          "tags": [
            "Products"
          ],
          "summary": "Update a product",
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Updated product"
            }
          }
        },
        "delete": {
          "tags": [
            "Products"
          ],
          "summary": "Delete a product",
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "Deleted"
            }
          }
        }
      },
      "/products/{id}/image": {
        "post": {
          "tags": [
            "Products"
          ],
          "summary": "Upload or replace a product image",
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "image"
                  ],
                  "properties": {
                    "image": {
                      "type": "string",
                      "format": "binary",
                      "description": "JPG or PNG image, max 5 MB"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Updated product"
            },
            "400": {
              "description": "Invalid or missing image"
            },
            "404": {
              "description": "Product not found"
            }
          }
        }
      },
      "/inventory": {
        "get": {
          "tags": [
            "Inventory"
          ],
          "summary": "List stock levels for all products in the tenant",
          "parameters": [
            {
              "in": "query",
              "name": "page",
              "schema": {
                "type": "integer",
                "default": 1
              }
            },
            {
              "in": "query",
              "name": "limit",
              "schema": {
                "type": "integer",
                "default": 20
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Paginated stock list"
            }
          }
        }
      },
      "/inventory/{productId}": {
        "patch": {
          "tags": [
            "Inventory"
          ],
          "summary": "Adjust stock for a product (set / add / subtract)",
          "parameters": [
            {
              "in": "path",
              "name": "productId",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "quantity",
                    "operation"
                  ],
                  "properties": {
                    "quantity": {
                      "type": "integer",
                      "minimum": 0
                    },
                    "operation": {
                      "type": "string",
                      "enum": [
                        "set",
                        "add",
                        "subtract"
                      ],
                      "description": "set overwrites, add increments, subtract decrements"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Updated stock"
            },
            "400": {
              "description": "Stock cannot go negative"
            },
            "404": {
              "description": "Product not found"
            }
          }
        }
      },
      "/catalog": {
        "get": {
          "tags": [
            "Catalog"
          ],
          "summary": "List catalogs for the tenant (metadata only)",
          "parameters": [
            {
              "in": "query",
              "name": "page",
              "schema": {
                "type": "integer",
                "default": 1
              }
            },
            {
              "in": "query",
              "name": "limit",
              "schema": {
                "type": "integer",
                "default": 20
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Paginated catalog list"
            }
          }
        }
      },
      "/catalog/upload": {
        "post": {
          "tags": [
            "Catalog"
          ],
          "summary": "Upload a CSV file and ingest it as a JSONB catalog (used by fetch_catalog AI tool)",
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "file"
                  ],
                  "properties": {
                    "file": {
                      "type": "string",
                      "format": "binary",
                      "description": "CSV file"
                    },
                    "name": {
                      "type": "string",
                      "description": "Catalog name (defaults to filename)"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Catalog created from CSV"
            },
            "400": {
              "description": "Bad file or parse error"
            }
          }
        }
      },
      "/catalog/form": {
        "post": {
          "tags": [
            "Catalog"
          ],
          "summary": "Ingest a catalog from a JSON payload (array of item objects)",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "name",
                    "items"
                  ],
                  "properties": {
                    "name": {
                      "type": "string"
                    },
                    "items": {
                      "type": "array",
                      "items": {
                        "type": "object"
                      },
                      "description": "Each object is a product/item entry. Include priceMinor (int) or price (float)."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Catalog created from form data"
            }
          }
        }
      },
      "/catalog/{id}": {
        "get": {
          "tags": [
            "Catalog"
          ],
          "summary": "Get a catalog including its full JSONB data payload",
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Catalog with data"
            },
            "404": {
              "description": "Not found"
            }
          }
        },
        "delete": {
          "tags": [
            "Catalog"
          ],
          "summary": "Delete a catalog",
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "Deleted"
            }
          }
        }
      },
      "/website/settings": {
        "get": {
          "tags": [
            "Website"
          ],
          "summary": "Get website builder settings for the tenant",
          "responses": {
            "200": {
              "description": "Website settings"
            }
          }
        },
        "put": {
          "tags": [
            "Website"
          ],
          "summary": "Update website builder settings for the tenant",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "theme": {
                      "type": "object"
                    },
                    "navigation": {
                      "type": "array",
                      "items": {
                        "type": "object"
                      }
                    },
                    "seo": {
                      "type": "object"
                    },
                    "social": {
                      "type": "object"
                    },
                    "published": {
                      "type": "boolean"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Updated website settings"
            }
          }
        }
      },
      "/website/storefront": {
        "get": {
          "tags": [
            "Website"
          ],
          "summary": "Public storefront — business info + published pages + in-stock products",
          "responses": {
            "200": {
              "description": "Storefront payload"
            },
            "404": {
              "description": "Business profile not set up"
            }
          }
        }
      },
      "/website/pages": {
        "get": {
          "tags": [
            "Website"
          ],
          "summary": "List CMS pages for the tenant",
          "parameters": [
            {
              "in": "query",
              "name": "page",
              "schema": {
                "type": "integer",
                "default": 1
              }
            },
            {
              "in": "query",
              "name": "limit",
              "schema": {
                "type": "integer",
                "default": 20
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Paginated page list"
            }
          }
        },
        "post": {
          "tags": [
            "Website"
          ],
          "summary": "Create a new CMS page",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "slug",
                    "title"
                  ],
                  "properties": {
                    "slug": {
                      "type": "string",
                      "description": "Lowercase alphanumeric with hyphens",
                      "e.g. about-us": null
                    },
                    "title": {
                      "type": "string"
                    },
                    "content": {
                      "type": "object",
                      "description": "Structured page content (blocks",
                      "sections": null,
                      "etc.)": null
                    },
                    "published": {
                      "type": "boolean",
                      "default": false
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Page created"
            },
            "400": {
              "description": "Slug already exists"
            }
          }
        }
      },
      "/website/pages/{slug}": {
        "get": {
          "tags": [
            "Website"
          ],
          "summary": "Get a CMS page by slug",
          "parameters": [
            {
              "in": "path",
              "name": "slug",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Page"
            },
            "404": {
              "description": "Not found"
            }
          }
        },
        "put": {
          "tags": [
            "Website"
          ],
          "summary": "Update a CMS page",
          "parameters": [
            {
              "in": "path",
              "name": "slug",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Updated page"
            }
          }
        },
        "delete": {
          "tags": [
            "Website"
          ],
          "summary": "Delete a CMS page",
          "parameters": [
            {
              "in": "path",
              "name": "slug",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "Deleted"
            }
          }
        }
      },
      "/website/pages/{slug}/publish": {
        "patch": {
          "tags": [
            "Website"
          ],
          "summary": "Publish or unpublish a page",
          "parameters": [
            {
              "in": "path",
              "name": "slug",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "published"
                  ],
                  "properties": {
                    "published": {
                      "type": "boolean"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Updated page"
            }
          }
        }
      },
      "/webhook": {
        "get": {
          "summary": "Verify WhatsApp Webhook",
          "tags": [
            "WhatsApp"
          ],
          "parameters": [
            {
              "in": "query",
              "name": "hub.mode",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "in": "query",
              "name": "hub.verify_token",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "in": "query",
              "name": "hub.challenge",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Webhook verified",
              "content": {
                "text/plain": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            }
          }
        },
        "post": {
          "summary": "Receive WhatsApp Messages",
          "tags": [
            "WhatsApp"
          ],
          "responses": {
            "200": {
              "description": "Message received"
            }
          }
        }
      },
      "/whatsapp/connect": {
        "post": {
          "summary": "Connect WhatsApp via Meta Embedded Signup",
          "tags": [
            "WhatsApp"
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "code",
                    "wabaId",
                    "phoneNumberId"
                  ],
                  "properties": {
                    "code": {
                      "type": "string",
                      "description": "OAuth code from Meta Embedded Signup popup"
                    },
                    "redirectUri": {
                      "type": "string"
                    },
                    "wabaId": {
                      "type": "string",
                      "description": "WhatsApp Business Account ID from Meta"
                    },
                    "phoneNumberId": {
                      "type": "string",
                      "description": "Phone Number ID from Meta"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "WhatsApp account connected"
            }
          }
        }
      },
      "/conversations": {
        "get": {
          "tags": [
            "Conversations"
          ],
          "summary": "List conversations for the tenant",
          "parameters": [
            {
              "in": "query",
              "name": "page",
              "schema": {
                "type": "integer",
                "default": 1
              }
            },
            {
              "in": "query",
              "name": "limit",
              "schema": {
                "type": "integer",
                "default": 25
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Paginated conversations"
            }
          }
        }
      },
      "/conversations/{id}/messages": {
        "get": {
          "tags": [
            "Conversations"
          ],
          "summary": "Get message history for a conversation",
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Paginated messages"
            }
          }
        }
      },
      "/conversations/{id}/resolve": {
        "patch": {
          "tags": [
            "Conversations"
          ],
          "summary": "Close a conversation",
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Conversation resolved"
            }
          }
        }
      },
      "/customers": {
        "get": {
          "tags": [
            "Customers"
          ],
          "summary": "List all customers (CRM)",
          "parameters": [
            {
              "in": "query",
              "name": "page",
              "schema": {
                "type": "integer",
                "default": 1
              }
            },
            {
              "in": "query",
              "name": "limit",
              "schema": {
                "type": "integer",
                "default": 20
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Paginated customers"
            }
          }
        }
      },
      "/customers/{id}": {
        "get": {
          "tags": [
            "Customers"
          ],
          "summary": "Get a single customer",
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Customer"
            },
            "404": {
              "description": "Not found"
            }
          }
        },
        "patch": {
          "tags": [
            "Customers"
          ],
          "summary": "Update customer name or meta",
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Updated customer"
            }
          }
        },
        "delete": {
          "tags": [
            "Customers"
          ],
          "summary": "Delete a customer record",
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "Deleted"
            }
          }
        }
      },
      "/orders": {
        "get": {
          "summary": "List orders for the tenant",
          "tags": [
            "Orders"
          ],
          "parameters": [
            {
              "in": "query",
              "name": "status",
              "schema": {
                "type": "string",
                "enum": [
                  "pending",
                  "confirmed",
                  "paid",
                  "fulfilled",
                  "cancelled"
                ]
              }
            },
            {
              "in": "query",
              "name": "customerId",
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Paginated list of orders"
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        },
        "post": {
          "summary": "Create a new order",
          "tags": [
            "Orders"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "customerId": {
                      "type": "string",
                      "format": "uuid",
                      "nullable": true
                    },
                    "status": {
                      "type": "string",
                      "enum": [
                        "pending",
                        "confirmed",
                        "paid",
                        "fulfilled",
                        "cancelled"
                      ],
                      "default": "pending"
                    },
                    "totalMinor": {
                      "type": "integer",
                      "minimum": 0,
                      "default": 0,
                      "description": "Amount in the smallest currency unit (e.g. kobo, cents)"
                    },
                    "currency": {
                      "type": "string",
                      "minLength": 3,
                      "maxLength": 3,
                      "default": "NGN"
                    },
                    "items": {
                      "type": "array",
                      "items": {}
                    },
                    "measurements": {
                      "type": "object"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Order created"
            },
            "400": {
              "description": "Validation error"
            }
          }
        }
      },
      "/orders/{id}": {
        "get": {
          "summary": "Get a single order by ID",
          "tags": [
            "Orders"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Order details"
            },
            "404": {
              "description": "Order not found"
            }
          }
        },
        "patch": {
          "summary": "Update order details",
          "tags": [
            "Orders"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "customerId": {
                      "type": "string",
                      "format": "uuid",
                      "nullable": true
                    },
                    "status": {
                      "type": "string",
                      "enum": [
                        "pending",
                        "confirmed",
                        "paid",
                        "fulfilled",
                        "cancelled"
                      ]
                    },
                    "totalMinor": {
                      "type": "integer",
                      "minimum": 0
                    },
                    "currency": {
                      "type": "string"
                    },
                    "items": {
                      "type": "array",
                      "items": {}
                    },
                    "measurements": {
                      "type": "object"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Order updated"
            },
            "400": {
              "description": "Validation error"
            },
            "404": {
              "description": "Order not found"
            }
          }
        }
      },
      "/orders/{id}/status": {
        "patch": {
          "summary": "Update the status of an order",
          "tags": [
            "Orders"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "status"
                  ],
                  "properties": {
                    "status": {
                      "type": "string",
                      "enum": [
                        "pending",
                        "confirmed",
                        "paid",
                        "fulfilled",
                        "cancelled"
                      ]
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Status updated"
            },
            "400": {
              "description": "Validation error"
            },
            "404": {
              "description": "Order not found"
            }
          }
        }
      },
      "/quotes": {
        "get": {
          "summary": "List quotes for the tenant",
          "tags": [
            "Quotes"
          ],
          "parameters": [
            {
              "in": "query",
              "name": "status",
              "schema": {
                "type": "string",
                "enum": [
                  "draft",
                  "sent",
                  "accepted",
                  "rejected",
                  "cancelled"
                ]
              }
            },
            {
              "in": "query",
              "name": "customerId",
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Paginated list of quotes"
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        },
        "post": {
          "summary": "Create a new quote",
          "tags": [
            "Quotes"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "customerId": {
                      "type": "string",
                      "format": "uuid",
                      "nullable": true
                    },
                    "status": {
                      "type": "string",
                      "enum": [
                        "draft",
                        "sent",
                        "accepted",
                        "rejected",
                        "cancelled"
                      ],
                      "default": "draft"
                    },
                    "amountMinor": {
                      "type": "integer",
                      "minimum": 0,
                      "default": 0,
                      "description": "Amount in the smallest currency unit (e.g. kobo, cents)"
                    },
                    "currency": {
                      "type": "string",
                      "minLength": 3,
                      "maxLength": 3,
                      "default": "NGN"
                    },
                    "details": {
                      "type": "object"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Quote created"
            },
            "400": {
              "description": "Validation error"
            }
          }
        }
      },
      "/quotes/{id}": {
        "get": {
          "summary": "Get a single quote by ID",
          "tags": [
            "Quotes"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Quote details"
            },
            "404": {
              "description": "Quote not found"
            }
          }
        },
        "patch": {
          "summary": "Update quote details",
          "tags": [
            "Quotes"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "customerId": {
                      "type": "string",
                      "format": "uuid",
                      "nullable": true
                    },
                    "status": {
                      "type": "string",
                      "enum": [
                        "draft",
                        "sent",
                        "accepted",
                        "rejected",
                        "cancelled"
                      ]
                    },
                    "amountMinor": {
                      "type": "integer",
                      "minimum": 0
                    },
                    "currency": {
                      "type": "string"
                    },
                    "details": {
                      "type": "object"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Quote updated"
            },
            "400": {
              "description": "Validation error"
            },
            "404": {
              "description": "Quote not found"
            }
          }
        }
      },
      "/quotes/{id}/status": {
        "patch": {
          "summary": "Update the status of a quote",
          "tags": [
            "Quotes"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "status"
                  ],
                  "properties": {
                    "status": {
                      "type": "string",
                      "enum": [
                        "draft",
                        "sent",
                        "accepted",
                        "rejected",
                        "cancelled"
                      ]
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Status updated"
            },
            "400": {
              "description": "Validation error"
            },
            "404": {
              "description": "Quote not found"
            }
          }
        }
      },
      "/payments/initialize": {
        "post": {
          "summary": "Initialize a payment for an order",
          "tags": [
            "Payments"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "orderId",
                    "email"
                  ],
                  "properties": {
                    "orderId": {
                      "type": "string",
                      "format": "uuid"
                    },
                    "email": {
                      "type": "string",
                      "format": "email",
                      "description": "Customer email for the payment gateway"
                    },
                    "provider": {
                      "type": "string",
                      "description": "Payment provider to use (defaults to tenant config). e.g. paystack"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Payment initialized — returns gateway authorization URL",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "authorizationUrl": {
                            "type": "string"
                          },
                          "reference": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Validation error or unsupported provider"
            },
            "404": {
              "description": "Order not found"
            }
          }
        }
      },
      "/payments/webhook/{provider}": {
        "post": {
          "summary": "Receive a payment webhook from a gateway",
          "tags": [
            "Payments"
          ],
          "security": [],
          "parameters": [
            {
              "in": "path",
              "name": "provider",
              "required": false,
              "schema": {
                "type": "string"
              },
              "description": "Payment provider name (e.g. paystack). Falls back to tenant default."
            }
          ],
          "requestBody": {
            "description": "Webhook payload from the payment provider",
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Webhook received and processed"
            },
            "400": {
              "description": "Invalid signature or unknown event"
            }
          }
        }
      },
      "/payments/{id}": {
        "get": {
          "summary": "Get a payment record by ID",
          "tags": [
            "Payments"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "format": "uuid"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Payment details"
            },
            "404": {
              "description": "Payment not found"
            }
          }
        }
      },
      "/notifications/send": {
        "post": {
          "tags": [
            "Notifications"
          ],
          "summary": "Send a notification via email, whatsapp or sms",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "channel",
                    "to",
                    "text"
                  ],
                  "properties": {
                    "channel": {
                      "type": "string",
                      "enum": [
                        "email",
                        "whatsapp",
                        "sms"
                      ]
                    },
                    "to": {
                      "type": "string"
                    },
                    "subject": {
                      "type": "string"
                    },
                    "text": {
                      "type": "string"
                    },
                    "html": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Notification sent"
            }
          }
        }
      },
      "/onboarding/status": {
        "get": {
          "summary": "Get onboarding completion status for the current tenant",
          "description": "Returns which onboarding steps are complete and the next pending step.",
          "tags": [
            "Onboarding"
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Onboarding status",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "steps": {
                            "type": "object",
                            "properties": {
                              "account": {
                                "type": "boolean"
                              },
                              "business": {
                                "type": "boolean"
                              },
                              "whatsapp": {
                                "type": "boolean"
                              },
                              "subscription": {
                                "type": "boolean"
                              }
                            }
                          },
                          "nextStep": {
                            "type": "string",
                            "nullable": true,
                            "example": "business"
                          },
                          "completed": {
                            "type": "boolean"
                          },
                          "subscription": {
                            "type": "object",
                            "nullable": true
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/onboarding/steps/{step}/complete": {
        "post": {
          "summary": "Manually mark an onboarding step complete (admin override)",
          "description": "Forces a specific onboarding step to a completed state for the current tenant, regardless of the underlying data (e.g. support waiving WhatsApp verification). Requires super admin status or the 'onboarding:override' permission. The 'account' step cannot be overridden since it is trivially always true.\n",
          "tags": [
            "Onboarding"
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "step",
              "required": true,
              "schema": {
                "type": "string",
                "enum": [
                  "business",
                  "whatsapp",
                  "subscription"
                ]
              },
              "description": "The onboarding step to mark complete"
            }
          ],
          "responses": {
            "200": {
              "description": "Updated onboarding status",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "steps": {
                            "type": "object",
                            "properties": {
                              "account": {
                                "type": "boolean"
                              },
                              "business": {
                                "type": "boolean"
                              },
                              "whatsapp": {
                                "type": "boolean"
                              },
                              "subscription": {
                                "type": "boolean"
                              }
                            }
                          },
                          "nextStep": {
                            "type": "string",
                            "nullable": true
                          },
                          "completed": {
                            "type": "boolean"
                          },
                          "subscription": {
                            "type": "object",
                            "nullable": true
                          },
                          "overriddenSteps": {
                            "type": "array",
                            "items": {
                              "type": "string"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid or non-overridable step"
            },
            "403": {
              "description": "Caller is not a super admin or lacks the 'onboarding:override' permission"
            }
          }
        }
      }
    },
    "tags": []
  },
  "customOptions": {
    "persistAuthorization": true
  }
};
  url = options.swaggerUrl || url
  var urls = options.swaggerUrls
  var customOptions = options.customOptions
  var spec1 = options.swaggerDoc
  var swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (var attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  var ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.oauth) {
    ui.initOAuth(customOptions.oauth)
  }

  if (customOptions.preauthorizeApiKey) {
    const key = customOptions.preauthorizeApiKey.authDefinitionKey;
    const value = customOptions.preauthorizeApiKey.apiKeyValue;
    if (!!key && !!value) {
      const pid = setInterval(() => {
        const authorized = ui.preauthorizeApiKey(key, value);
        if(!!authorized) clearInterval(pid);
      }, 500)

    }
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }

  window.ui = ui
}

