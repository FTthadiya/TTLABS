export const spec_batches = [
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
];

export function getSpecBatches() {
  return spec_batches;
}

export function getSpecNames() {
  const uniqueSpecNames = [];
  for (const item of spec_batches) {
    const existingSpec = uniqueSpecNames.find(
      (spec) => spec.name === item.spec_name
    );
    if (!existingSpec) {
      uniqueSpecNames.push({
        _id: uniqueSpecNames.length + 1,
        name: item.spec_name,
      });
    }
  }
  return uniqueSpecNames;
}

export function getBatches() {
  const uniqueBatches = [];

  for (const item of spec_batches) {
    const existingBatch = uniqueBatches.find(
      (batch) => batch.year === item.year && batch.semester === item.semester
    );

    if (!existingBatch) {
      uniqueBatches.push({
        _id: uniqueBatches.length + 1,
        name: `Year ${item.year} Semester ${item.semester}`,
        year: item.year,
        semester: item.semester,
      });
    }
  }

  return uniqueBatches;
}

export function getSpecBatchUsingData(spec_name, year, semester) {
  return spec_batches.find(
    (sb) =>
      sb.spec_name === spec_name && sb.year === year && sb.semester === semester
  );
}
export function getSpecBatchById(id) {
  return spec_batches.find((sb) => sb._id === id);
}
