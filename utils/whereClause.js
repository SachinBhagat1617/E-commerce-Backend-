//base->  product.find()
//base-> product.find({name:'T-shirt'})

// bigQ->json// req.url
//bigQ-> //search=coder&page=2&category=shortsleeves&rating[gte]=4
// &price[lte]=999&price[gte]=199&limit=5

//if you do console.log(bigQ) // it will return json object of bigQ in key value pair

class whereClause {
  constructor(base, bigQ) {
    this.base = base;
    this.bigQ = bigQ; // bigQ->json
  }
  search() {
    //if search keyword exist
    const searchword = this.bigQ.search
      ? {
          name: {
            // object because find method requires object
            $regex: this.bigQ.search,
            $options: "i", // i for case sensitive
          },
        }
      : {};

    this.base = this.base.find({ ...searchword });
    return this; //if devloper wants bigQ also return all the context
  }

  filter() {
    const copyQ = { ...this.bigQ }; //json object
    //now you need to search rating and price and rest you other you already handled in search and filter
    delete copyQ["search"]; // copyQ.search // object
    delete copyQ["limit"];
    delete copyQ["page"];

    // since you know that you have to add "$" before gte and lte // so convert it to string and use regex to do
    let stringofCopyQ = JSON.stringify(copyQ); //string

    // str.replace(/regex/g, m=>`$${m}`)
    stringofCopyQ = stringofCopyQ.replace(
      /\b(gte| lte| lt| gt)\b/g,
      (m) => `$${m}`
    ); // for every match 'm'->{gte | lte| lt | gt} add $ before it here g is global

    const jsonofCopyQ = JSON.parse(stringofCopyQ);
    this.base = this.base.find(jsonofCopyQ);
    return this;
  }

  pager(resultperPage) {
    let currentpage = 1;
    if (this.bigQ.page) {
      currentpage = this.bigQ.page;
    }

    const skipVal = resultperPage * (currentpage - 1); // kitne ko skip karna hai
    this.base = this.base.limit(resultperPage).skip(skipVal);
    return this;
  }
}

module.exports = whereClause;
