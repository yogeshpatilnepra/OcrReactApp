export default class Type1 {
    constructor(
        company_name_address = "",
        contact_person = "",
        phone_email = "",
        product_name = "",
    ) {
        this.company_name_address = company_name_address;
        this.contact_person = contact_person;
        this.phone_email = phone_email;
        this.product_name = product_name;
    }

    setData(extractedData) {
        extractedData.forEach((item) => {
            if (item.company_name_address) this.company_name_address = item.company_name_address
            if (item.contact_person) this.contact_person = item.contact_person
            if (item.phone_email) this.phone_email = item.phone_email
            if (item.product_name) this.product_name = item.product_name
        })
    }
}