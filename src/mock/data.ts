import { Case } from "../types";

export const MOCK_CASES: Case[] = [
  {
    id: "1",
    patientName: "John Doe",
    caseType: "Crown",
    status: "Design",
    technician: "Alex Smith",
    dueDate: "2024-05-10",
    createdAt: "2024-05-01",
    description: "Single unit crown on #14. Material: Zirconia.",
    files: [
      { id: "f1", name: "upper_scan_v2.obj", url: "#", type: "model", size: "12MB", version: 2, uploadedAt: "2024-05-02T10:00:00Z" },
      { id: "f2", name: "lower_scan.obj", url: "#", type: "model", size: "10MB", version: 1, uploadedAt: "2024-05-01T09:00:00Z" },
    ],
    comments: [
      { id: "c1", sender: "Alex Smith", text: "Initial design completed. Please review.", timestamp: "2024-05-02T10:00:00Z", isOwn: false },
      { id: "c1_reply", sender: "Dr. Sarah Wilson", text: "Thanks Alex, checking it now.", timestamp: "2024-05-02T10:15:00Z", isOwn: true },
    ],
    annotations: [
      { id: "a1", position: [0.5, 0.2, 0.1], text: "Check margin here, seems a bit tight", author: "Alex Smith", timestamp: "2024-05-02T10:05:00Z", resolved: false },
      { id: "a2", position: [-0.3, 0.5, -0.2], text: "Adjust occlusion contact", author: "Dr. Sarah Wilson", timestamp: "2024-05-02T10:20:00Z", resolved: false },
    ],
    timeline: [
      { id: "t1", status: "Created", description: "Case created", timestamp: "2024-05-01T09:00:00Z", author: "Dr. Sarah Wilson" },
      { id: "t2", status: "ScanReceived", description: "Scans uploaded", timestamp: "2024-05-01T09:05:00Z", author: "System" },
      { id: "t3", status: "Design", description: "Design phase started", timestamp: "2024-05-02T08:00:00Z", author: "Alex Smith" }
    ]
  },
  {
    id: "2",
    patientName: "Jane Roe",
    caseType: "Implant",
    status: "ScanReceived",
    technician: "Sarah Jones",
    dueDate: "2024-05-15",
    createdAt: "2024-05-02",
    description: "Implant guide for #19.",
    files: [
      { id: "f3", name: "ct_scan.dicom", url: "#", type: "model", size: "45MB", version: 1, uploadedAt: "2024-05-02T11:00:00Z" },
    ],
    comments: [],
    annotations: [],
    timeline: [
      { id: "t4", status: "Created", description: "Case created", timestamp: "2024-05-02T11:00:00Z", author: "Dr. Sarah Wilson" },
      { id: "t5", status: "ScanReceived", description: "CT Scan uploaded", timestamp: "2024-05-02T11:05:00Z", author: "System" }
    ]
  },
  {
    id: "3",
    patientName: "Robert Miller",
    caseType: "Bridge",
    status: "AwaitingApproval",
    technician: "Alex Smith",
    dueDate: "2024-05-12",
    createdAt: "2024-04-28",
    description: "3-unit bridge #3 to #5.",
    files: [
      { id: "f4", name: "bridge_design_final.obj", url: "#", type: "model", size: "22MB", version: 3, uploadedAt: "2024-05-03T08:30:00Z" },
    ],
    comments: [
      { id: "c2", sender: "Alex Smith", text: "Ready for your approval Dr. Wilson.", timestamp: "2024-05-03T08:45:00Z", isOwn: false },
      { id: "c3", sender: "Dr. Sarah Wilson", text: "Looks good, proceed with production.", timestamp: "2024-05-03T09:00:00Z", isOwn: true },
    ],
    annotations: [],
    timeline: [
      { id: "t6", status: "Created", description: "Case created", timestamp: "2024-04-28T09:00:00Z", author: "Dr. Sarah Wilson" },
      { id: "t7", status: "Design", description: "Design phase started", timestamp: "2024-04-29T10:00:00Z", author: "Alex Smith" },
      { id: "t8", status: "AwaitingApproval", description: "Sent for approval", timestamp: "2024-05-03T08:45:00Z", author: "Alex Smith" }
    ]
  },
  {
    id: "4",
    patientName: "Emily Brown",
    caseType: "Veneer",
    status: "InProduction",
    technician: "Mike Ross",
    dueDate: "2024-05-08",
    createdAt: "2024-04-25",
    description: "6 veneers on anterior teeth.",
    files: [],
    comments: [],
    annotations: [],
    timeline: [
      { id: "t9", status: "Created", description: "Case created", timestamp: "2024-04-25T09:00:00Z", author: "Dr. Sarah Wilson" },
      { id: "t10", status: "InProduction", description: "Started milling", timestamp: "2024-05-01T14:00:00Z", author: "Mike Ross" }
    ]
  },
  {
    id: "5",
    patientName: "Michael Scott",
    caseType: "Crown",
    status: "Shipped",
    technician: "Sarah Jones",
    dueDate: "2024-05-05",
    createdAt: "2024-04-20",
    description: "Full contour zirconia crown on #30.",
    files: [],
    comments: [],
    annotations: [],
    timeline: [
      { id: "t11", status: "Created", description: "Case created", timestamp: "2024-04-20T09:00:00Z", author: "Dr. Sarah Wilson" },
      { id: "t12", status: "Shipped", description: "Package dispatched via FedEx", timestamp: "2024-05-04T16:00:00Z", author: "System" }
    ]
  },
];

