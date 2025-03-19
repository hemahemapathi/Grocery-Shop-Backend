export const filterData = (query, queryStr) => {
  // Filter by category
  if (queryStr.category) {
    query = query.find({ category: queryStr.category });
  }

  // Filter by search term
  if (queryStr.keyword) {
    query = query.find({
      name: {
        $regex: queryStr.keyword,
        $options: "i",
      },
    });
  }

  return query;
};
