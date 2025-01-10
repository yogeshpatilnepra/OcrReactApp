export default class Type5 {
    constructor(
        name = "",
        factory = "",
        office = "",
        contact = "",
        mobile = "",
        email = "",
        product = ""
    ) {
        this.name = name;
        this.factory = factory;
        this.office = office;
        this.contact = contact;
        this.mobile = mobile;
        this.email = email;
        this.product = product;
    }

    setData(extractedData) {
        extractedData.forEach((item) => {
            if (item.name) this.name = item.name
            if (item.factory) this.factory = item.factory
            if (item.office) this.office = item.office
            if (item.contact) this.contact = item.contact
            if (item.mobile) this.mobile = item.mobile
            if (item.email) this.email = item.email
            if (item.product) this.product = item.product
        })
    }
}