export default class Type3 {
    constructor(
        name = "",
        address = "",
        contact = "",
        email = "",
        contact_person = "",
        products = ""
    ) {
        this.name = name;
        this.address = address;
        this.contact = contact;
        this.email = email;
        this.contact_person = contact_person;
        this.products = products;
    }

    setData(extractedData) {
        extractedData.forEach((item) => {
            if (item.name) this.name = item.name
            if (item.address) this.address = item.address
            if (item.contact) this.contact = item.contact
            if (item.email) this.email = item.email
            if (item.contact_person) this.contact_person = item.contact_person
            if (item.products) this.products = item.products
        })
    }
}