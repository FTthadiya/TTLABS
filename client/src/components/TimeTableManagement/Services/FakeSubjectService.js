const subjects = [
  {
    _id: "61f085e3b64ae378753d2d19",
    subject_name: "Subject 1",
    subject_code: "S1",
    session_type: "Lecture",
    duration: "2",
    studentCount: "20",
    lecturer: {
      _id: "61f085e3b64ae378753d2d18",
      lect_name: "Dr. A",
    },
    specilizationBatch: [
      {
        _id: "61f085e3b64ae378753d2d01",
        spec_name: "Software Engineering",
        year: "1",
        semester: "1",
      },
      {
        _id: "61f085e3b64ae378753d2d02",
        spec_name: "Software Engineering",
        year: "1",
        semester: "2",
      },
      {
        _id: "61f085e3b64ae378753d2d03",
        spec_name: "Software Engineering",
        year: "2",
        semester: "1",
      },
    ],
  },
  {
    _id: "61f085e3b64ae378753d2d1a",
    subject_name: "Subject 1",
    subject_code: "S1",
    session_type: "Lab",
    duration: "1",
    studentCount: "20",
    lecturer: {
      _id: "61f085e3b64ae378753d2d0d",
      lect_name: "Dr. B",
    },
    specilizationBatch: [
      {
        _id: "61f085e3b64ae378753d2d01",
        spec_name: "Software Engineering",
        year: "1",
        semester: "1",
      },
      {
        _id: "61f085e3b64ae378753d2d02",
        spec_name: "Software Engineering",
        year: "1",
        semester: "2",
      },
      {
        _id: "61f085e3b64ae378753d2d03",
        spec_name: "Software Engineering",
        year: "2",
        semester: "1",
      },
    ],
  },
  {
    _id: "61f085e3b64ae378753d2d1b",
    subject_name: "Subject 2",
    subject_code: "S2",
    session_type: "Lecture",
    duration: "2",
    studentCount: "10",
    lecturer: {
      _id: "61f085e3b64ae378753d2d0e",
      lect_name: "Dr. C",
    },
    specilizationBatch: [
      {
        _id: "61f085e3b64ae378753d2d02",
        spec_name: "Software Engineering",
        year: "1",
        semester: "2",
      },
      {
        _id: "61f085e3b64ae378753d2d03",
        spec_name: "Software Engineering",
        year: "2",
        semester: "1",
      },
    ],
  },
  {
    _id: "61f085e3b64ae378753d2d1c",
    subject_name: "Subject 2",
    subject_code: "S2",
    session_type: "Lab",
    duration: "1",
    studentCount: "10",
    lecturer: {
      _id: "61f085e3b64ae378753d2d0e",
      lect_name: "Dr. C",
    },
    specilizationBatch: [
      {
        _id: "61f085e3b64ae378753d2d02",
        spec_name: "Software Engineering",
        year: "1",
        semester: "2",
      },
      {
        _id: "61f085e3b64ae378753d2d03",
        spec_name: "Software Engineering",
        year: "2",
        semester: "1",
      },
    ],
  },
  {
    _id: "61f085e3b64ae378753d2d1d",
    subject_name: "Subject 3",
    subject_code: "S3",
    session_type: "Lecture",
    duration: "2",
    studentCount: "14",
    lecturer: {
      _id: "61f085e3b64ae378753d2d0f",
      lect_name: "Dr. D",
    },
    specilizationBatch: [
      {
        _id: "61f085e3b64ae378753d2d04",
        spec_name: "Software Engineering",
        year: "2",
        semester: "2",
      },
      {
        _id: "61f085e3b64ae378753d2d05",
        spec_name: "Software Engineering",
        year: "3",
        semester: "1",
      },
      {
        _id: "61f085e3b64ae378753d2d06",
        spec_name: "Software Engineering",
        year: "3",
        semester: "2",
      },

      {
        _id: "61f085e3b64ae378753d2d07",
        spec_name: "Information Technology",
        year: "1",
        semester: "1",
      },
    ],
  },
  {
    _id: "61f085e3b64ae378753d2d1e",
    subject_name: "Subject 3",
    subject_code: "S3",
    session_type: "Tute",
    duration: "1",
    studentCount: "14",
    lecturer: {
      _id: "61f085e3b64ae378753d2d10",
      lect_name: "Dr. E",
    },
    specilizationBatch: [
      {
        _id: "61f085e3b64ae378753d2d04",
        spec_name: "Software Engineering",
        year: "2",
        semester: "2",
      },
      {
        _id: "61f085e3b64ae378753d2d05",
        spec_name: "Software Engineering",
        year: "3",
        semester: "1",
      },
      {
        _id: "61f085e3b64ae378753d2d06",
        spec_name: "Software Engineering",
        year: "3",
        semester: "2",
      },
      {
        _id: "61f085e3b64ae378753d2d07",
        spec_name: "Information Technology",
        year: "1",
        semester: "1",
      },
    ],
  },
  {
    _id: "61f085e3b64ae378753d2d1f",
    subject_name: "Subject 4",
    subject_code: "S4",
    session_type: "Lecture",
    duration: "2",
    studentCount: "12",
    lecturer: {
      _id: "61f085e3b64ae378753d2d11",
      lect_name: "Dr. F",
    },
    specilizationBatch: [
      {
        _id: "61f085e3b64ae378753d2d06",
        spec_name: "Software Engineering",
        year: "3",
        semester: "2",
      },
    ],
  },
  {
    _id: "61f085e3b64ae378753d2d20",
    subject_name: "Subject 4",
    subject_code: "S4",
    session_type: "Lab",
    duration: "1",
    studentCount: "12",
    lecturer: {
      _id: "61f085e3b64ae378753d2d11",
      lect_name: "Dr. F",
    },
    specilizationBatch: [
      {
        _id: "61f085e3b64ae378753d2d06",
        spec_name: "Software Engineering",
        year: "3",
        semester: "2",
      },
    ],
  },
  {
    _id: "61f085e3b64ae378753d2d21",
    subject_name: "Subject 5",
    subject_code: "S5",
    session_type: "Lecture",
    duration: "2",
    studentCount: "17",
    lecturer: {
      _id: "61f085e3b64ae378753d2d12",
      lect_name: "Dr. G",
    },
    specilizationBatch: [
      {
        _id: "61f085e3b64ae378753d2d07",
        spec_name: "Information Technology",
        year: "1",
        semester: "1",
      },
      {
        _id: "61f085e3b64ae378753d2d08",
        spec_name: "Information Technology",
        year: "1",
        semester: "2",
      },
      {
        _id: "61f085e3b64ae378753d2d09",
        spec_name: "Information Technology",
        year: "2",
        semester: "1",
      },
      {
        _id: "61f085e3b64ae378753d2d0a",
        spec_name: "Information Technology",
        year: "2",
        semester: "2",
      },
    ],
  },
  {
    _id: "61f085e3b64ae378753d2d22",
    subject_name: "Subject 5",
    subject_code: "S5",
    session_type: "Tute",
    duration: "1",
    studentCount: "17",
    lecturer: {
      _id: "61f085e3b64ae378753d2d13",
      lect_name: "Dr. H",
    },
    specilizationBatch: [
      {
        _id: "61f085e3b64ae378753d2d07",
        spec_name: "Information Technology",
        year: "1",
        semester: "1",
      },
      {
        _id: "61f085e3b64ae378753d2d08",
        spec_name: "Information Technology",
        year: "1",
        semester: "2",
      },
      {
        _id: "61f085e3b64ae378753d2d09",
        spec_name: "Information Technology",
        year: "2",
        semester: "1",
      },
      {
        _id: "61f085e3b64ae378753d2d0a",
        spec_name: "Information Technology",
        year: "2",
        semester: "2",
      },
    ],
  },
  {
    _id: "61f085e3b64ae378753d2d23",
    subject_name: "Subject 6",
    subject_code: "S6",
    session_type: "Lecture",
    duration: "2",
    studentCount: "20",
    lecturer: {
      _id: "61f085e3b64ae378753d2d14",
      lect_name: "Dr. I",
    },
    specilizationBatch: [
      {
        _id: "61f085e3b64ae378753d2d0a",
        spec_name: "Information Technology",
        year: "2",
        semester: "2",
      },
      {
        _id: "61f085e3b64ae378753d2d0b",
        spec_name: "Information Technology",
        year: "3",
        semester: "1",
      },
      {
        _id: "61f085e3b64ae378753d2d0c",
        spec_name: "Information Technology",
        year: "3",
        semester: "2",
      },
    ],
  },
  {
    _id: "61f085e3b64ae378753d2d24",
    subject_name: "Subject 6",
    subject_code: "S6",
    session_type: "Lab",
    duration: "1",
    studentCount: "20",
    lecturer: {
      _id: "61f085e3b64ae378753d2d14",
      lect_name: "Dr. I",
    },
    specilizationBatch: [
      {
        _id: "61f085e3b64ae378753d2d0a",
        spec_name: "Information Technology",
        year: "2",
        semester: "2",
      },
      {
        _id: "61f085e3b64ae378753d2d0b",
        spec_name: "Information Technology",
        year: "3",
        semester: "1",
      },
      {
        _id: "61f085e3b64ae378753d2d0c",
        spec_name: "Information Technology",
        year: "3",
        semester: "2",
      },
    ],
  },
];

export function getSubjects() {
  return subjects;
}
