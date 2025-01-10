export default class Type2 {
    constructor(
        name = "",
        address = "",
        contact = "",
        email = "",
        website = "",
        contact_person = "",
        product_service = "",
    ) {
        this.name = name;
        this.address = address;
        this.contact = contact;
        this.email = email;
        this.website = website;
        this.contact_person = contact_person;
        this.product_service = product_service;
    }

    setData(extractedData) {
        extractedData.forEach((item) => {
            if (item.name) this.name = item.name
            if (item.address) this.address = item.address
            if (item.contact) this.contact = item.contact
            if (item.email) this.email = item.email
            if (item.website) this.website = item.website
            if (item.contact_person) this.contact_person = item.contact_person
            if (item.product_service) this.product_service = item.product_service
        })
    }
}