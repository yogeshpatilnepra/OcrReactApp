export default class Type4 {
    constructor(
        name = "",
        membershipNo = "",
        address = "",
        gst = "",
        telNo = "",
        fax = "",
        email = "",
        website = "",
        contact_person = "",
        industrycategory = "",
        product = "",
        hsncode = ""
    ) {
        this.name = name;
        this.membershipNo = membershipNo;
        this.address = address;
        this.gst = gst;
        this.telNo = telNo;
        this.fax = fax;
        this.email = email;
        this.website = website;
        this.contact_person = contact_person;
        this.industrycategory = industrycategory;
        this.product = product;
        this.hsncode = hsncode;
    }

    setData(extractedData) {
        extractedData.forEach((item) => {
            if (item.name) this.name = item.name
            if (item.membershipNo) this.membershipNo = item.membershipNo
            if (item.address) this.address = item.address
            if (item.gst) this.gst = item.gst
            if (item.telNo) this.telNo = item.telNo
            if (item.fax) this.fax = item.fax
            if (item.email) this.email = item.email
            if (item.website) this.website = item.website
            if (item.contact_person) this.contact_person = item.contact_person
            if (item.industrycategory) this.industrycategory = item.industrycategory
            if (item.product) this.product = item.product
            if (item.hsncode) this.hsncode = item.hsncode
        })
    }
}