// Exemplo extraído de .agents/context/completo/kenko-backend-api.md: 4.5 Analytics — GET /api/analytics?period=month&reference=2026-10
export const analyticsMock = {
  "data": {
    "kpis": {
      "botCompletion": {
        "percentage": 50,
        "confirmedConversations": 4,
        "schedulingConversations": 8,
        "previousValue": 40,
        "difference": 10,
        "differenceUnit": "percentage_points"
      },
      "attendanceDuration": {
        "statistic": "median",
        "seconds": 150,
        "sampleSize": 4,
        "previousValue": 180,
        "difference": -30,
        "differenceUnit": "seconds"
      },
      "outsideBusinessHours": {
        "percentage": 30,
        "outsideConversations": 3,
        "startedConversations": 10,
        "previousValue": null,
        "difference": null,
        "differenceUnit": "percentage_points"
      },
      "agendaOccupancy": {
        "percentage": 50,
        "occupiedSlots": 10,
        "totalSlots": 20,
        "previousValue": 45,
        "difference": 5,
        "differenceUnit": "percentage_points"
      },
      "searchesWithoutSlots": {
        "count": 3,
        "previousValue": 2,
        "difference": 1,
        "differenceUnit": "count"
      }
    },
    "funnel": [
      {
        "stage": "started_scheduling",
        "count": 8,
        "percentage": 100
      },
      {
        "stage": "answered_specialty",
        "count": 7,
        "percentage": 87.5
      },
      {
        "stage": "received_slot_result",
        "count": 6,
        "percentage": 75
      },
      {
        "stage": "selected_slot",
        "count": 5,
        "percentage": 62.5
      },
      {
        "stage": "confirmed",
        "count": 4,
        "percentage": 50
      }
    ],
    "conversationEndings": [
      {
        "stage": "triage",
        "exited": 1,
        "abandoned": 1
      },
      {
        "stage": "slot_selection",
        "exited": 0,
        "abandoned": 1
      },
      {
        "stage": "patient_data",
        "exited": 1,
        "abandoned": 0
      },
      {
        "stage": "confirmation",
        "exited": 0,
        "abandoned": 0
      }
    ],
    "durationDistribution": {
      "unit": "seconds",
      "sampleSize": 4,
      "median": 150,
      "p90": 240,
      "buckets": [
        {
          "label": "1",
          "fromInclusive": 0,
          "toExclusive": 60,
          "count": 0
        },
        {
          "label": "2",
          "fromInclusive": 60,
          "toExclusive": 120,
          "count": 1
        },
        {
          "label": "3",
          "fromInclusive": 120,
          "toExclusive": 180,
          "count": 1
        },
        {
          "label": "4",
          "fromInclusive": 180,
          "toExclusive": 240,
          "count": 1
        },
        {
          "label": "5",
          "fromInclusive": 240,
          "toExclusive": 300,
          "count": 1
        },
        {
          "label": "6",
          "fromInclusive": 300,
          "toExclusive": 360,
          "count": 0
        },
        {
          "label": "7",
          "fromInclusive": 360,
          "toExclusive": 420,
          "count": 0
        },
        {
          "label": "8",
          "fromInclusive": 420,
          "toExclusive": 480,
          "count": 0
        },
        {
          "label": "9",
          "fromInclusive": 480,
          "toExclusive": 540,
          "count": 0
        },
        {
          "label": "10",
          "fromInclusive": 540,
          "toExclusive": 600,
          "count": 0
        },
        {
          "label": "10+",
          "fromInclusive": 600,
          "toExclusive": null,
          "count": 0
        }
      ]
    },
    "conversationHeatmap": {
      "bucketStartHours": [
        0,
        2,
        4,
        6,
        8,
        10,
        12,
        14,
        16,
        18,
        20,
        22
      ],
      "rows": [
        {
          "weekday": 1,
          "counts": [
            1,
            0,
            0,
            0,
            2,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        },
        {
          "weekday": 2,
          "counts": [
            1,
            0,
            0,
            0,
            3,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        },
        {
          "weekday": 3,
          "counts": [
            1,
            0,
            0,
            0,
            2,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        },
        {
          "weekday": 4,
          "counts": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        },
        {
          "weekday": 5,
          "counts": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        },
        {
          "weekday": 6,
          "counts": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        },
        {
          "weekday": 0,
          "counts": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        }
      ]
    },
    "completionSeries": {
      "grouping": "month_blocks",
      "movingAverageWindow": 3,
      "points": [
        {
          "label": "01–07",
          "started": 2,
          "confirmed": 1,
          "percentage": 50,
          "movingAverage": 50
        },
        {
          "label": "08–14",
          "started": 2,
          "confirmed": 1,
          "percentage": 50,
          "movingAverage": 50
        },
        {
          "label": "15–21",
          "started": 1,
          "confirmed": 0,
          "percentage": 0,
          "movingAverage": 33.3333333333
        },
        {
          "label": "22–28",
          "started": 2,
          "confirmed": 1,
          "percentage": 50,
          "movingAverage": 33.3333333333
        },
        {
          "label": "29–31",
          "started": 1,
          "confirmed": 1,
          "percentage": 100,
          "movingAverage": 50
        }
      ]
    },
    "searchesWithoutSlotsBySpecialty": [
      {
        "specialtyId": "sp_2",
        "name": "Dermatologia",
        "count": 2
      },
      {
        "specialtyId": "sp_3",
        "name": "Ortopedia",
        "count": 1
      }
    ]
  }
} as const;


export type AnalyticsMockType = typeof analyticsMock;
