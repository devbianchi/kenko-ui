// Exemplo extraído de docs/kenko-backend-api.md: 4.1 Clínica — GET /api/clinic
export const clinicaMock = {
  "data": {
    "id": "clinic_1",
    "name": "Clínica Demonstração",
    "address": "Rua de Exemplo, 100",
    "phone": "1100000000",
    "openingHours": [
      {
        "weekdays": [
          1,
          2,
          3,
          4,
          5
        ],
        "opensAt": "07:00",
        "closesAt": "18:00"
      },
      {
        "weekdays": [
          6
        ],
        "opensAt": "09:00",
        "closesAt": "13:00"
      },
      {
        "weekdays": [
          0
        ],
        "closed": true
      }
    ],
    "specialties": [
      {
        "id": "sp_1",
        "name": "Clínico geral"
      },
      {
        "id": "sp_2",
        "name": "Dermatologia"
      },
      {
        "id": "sp_3",
        "name": "Ortopedia"
      },
      {
        "id": "sp_4",
        "name": "Cardiologia"
      }
    ]
  }
} as const;

export type ClinicaMockType = typeof clinicaMock;
