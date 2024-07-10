export default class ApiFeature {
  constructor(mongooseQuery, queryStr) {
    this.mongooseQuery = mongooseQuery;
    this.queryStr = queryStr;
  }

  pagination() {
    let page = this.queryStr.page || 1;
    if (this.queryStr.page < 1) page = 1;
    let skip = (page - 1) * 10;
    this.page = page;
    this.mongooseQuery.skip(skip).limit(10);
    return this;
  }
  filter() {
    let filterObj = { ...this.queryStr };
    let excludeFields = ["page", "sort", "limit", "fields", "keyword"];
    excludeFields.forEach((el) => delete filterObj[el]);
    filterObj = JSON.stringify(filterObj);
    filterObj = filterObj.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    filterObj = JSON.parse(filterObj);

    this.mongooseQuery.find(filterObj);
    return this;
  }
  sort() {
    if (this.queryStr.sort) {
      let sortBy = this.queryStr.sort.split(",").join(" ");
      this.mongooseQuery.sort(sortBy);
    }
    return this;
  }
  search() {
    if (this.queryStr.keyword) {
      this.mongooseQuery.find({
        $or: [
          { title: { $regex: this.queryStr.keyword, $options: "i" } },
          { description: { $regex: this.queryStr.keyword, $options: "i" } },
        ],
      });
    }
    return this;
  }
  fields() {
    if (this.queryStr.fields) {
      let fields = this.queryStr.fields.split(",").join(" ");
      this.mongooseQuery.select(fields);
    }
    return this;
  }
  filterTwo(filterType, filterValue) {
    switch (filterType) {
      case "user":
        this.mongooseQuery.find({
          id: { $regex: `${filterValue}`, $options: "i" },
        });
        break;
      case "user":
        this.mongooseQuery.find({
          id: { $regex: `${filterValue}`, $options: "i" },
        });
        break;
      case "user":
        this.mongooseQuery.find({
          id: { $regex: `${filterValue}`, $options: "i" },
        });
        break;
    }
    return this;
  }
}
