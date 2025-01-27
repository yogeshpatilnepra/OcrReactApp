import { CurrentRenderContext, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Alert, Button, FlatList, Image, LogBox, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ImageCropPicker from "react-native-image-crop-picker";
import MLKit from "react-native-mlkit-ocr";
import Type2 from "../models/Type2";
import Type3 from "../models/Type3";

const Type3ProcessScreen = () => {
    const navigation = useNavigation();
    const [croppedImageUri, setCroppedImageUri] = useState('');
    const [extractedData, setExtractedData] = useState([])
    const [modalVisible, setModalVisible] = useState(false);
    const [recognizedText, setRecognizedText] = useState('');
    const [filePath, setFilePath] = useState('');
    // new for listblocks
    const [listBlocks, setListBlocks] = useState([]);
    const [listName, setListName] = useState([]);
    const [listAddress, setListAddress] = useState([]);
    const [listContact, setListContact] = useState([]);
    const [listEmail, setListEmail] = useState([]);
    const [listContactPerson, setListContactPerson] = useState([]);
    const [listProductService, setListProductService] = useState([]);

    //ocr start code
    const processOCR = async () => {
        const type3 = new Type3();
        try {
            const result = await MLKit.detectFromFile(croppedImageUri);
            const recognizedText = result.map(block => block.text).join('\n');

            setRecognizedText(recognizedText);
            setFilePath(croppedImageUri)
            const lines = recognizedText.split("\n")
            const data = getName(recognizedText)
            type3.setData(data)
            setExtractedData(type3)
            Alert.alert('OCR Complete', 'Text recognized successfully.');
            setExtractedData([]);
        } catch (error) {
            console.error('Error with OCR---->:', error.message);
        }
    };
    const openCamera = () => {
        ImageCropPicker.openCamera({
            cropping: true,
        }).then(image => {
            setCroppedImageUri(image.path);
        });
        setModalVisible(false);
    };

    const openGallery = () => {
        ImageCropPicker.openPicker({
            cropping: true,
        }).then(image => {
            setCroppedImageUri(image.path);
        });
        setModalVisible(false);
    };

    const getName = (data) => {
        data = recognizedText.split('\n');
        const names = [];
        data.forEach((line) => {
            const splitData = line.split(" ");
            if (splitData.length >= 2) {
                const numRegex = /^[0-9][0-9]*$/;
                const strRegex = /^(?:[A-Z0-9\s()-]*\.[A-Z0-9\s()-]*|\b[0-9A-Z][\w\s&().-]*\b)$/;
                if (numRegex.test(splitData[0]) && strRegex.test(splitData[1])) {
                    names.push(line);
                }
            }
        });
        console.log("names---", names)
        getAddress(data);
        setListName(names);
        return names;
    };

    const getAddress = (data) => {
        data = recognizedText.split('\n');
        const addresses = [];
        data.forEach((line,index) => {
            const splitData = line.split(" ");
            if (splitData.length >= 2) {
                const numRegex = /^[0-9][0-9]*$/;
                const strRegex = /^(?:[A-Z0-9\s()-]*\.[A-Z0-9\s()-]*|\b[0-9A-Z][\w\s&().-]*\b)$/;
                if (numRegex.test(splitData[0]) && strRegex.test(splitData[1])) {
                    let address = data[index + 1];
                    if (!data[index + 2]?.toLowerCase()?.includes("ph:") && !data[index + 2]?.toLowerCase()?.includes("email:")) {
                        address += ` ${data[index + 2]}`;
                    }
                    addresses.push(address);
                }
            }
        });
        console.log("addresses---", addresses)
        getTel(data);
        setListAddress(addresses);
        return addresses;
    };

    const getTel = (data) => {
        data = recognizedText.split('\n');
        const contacts = data
            .filter((line) => line.toLowerCase().includes("ph:"))
            .map((line) => line.replace("ph:", "").trim());

        setListContact(contacts);
        console.log("contacts---", contacts)
        getEmail(data);
        return contacts
    };

    const getEmail = (data) => {
        data = recognizedText.split("\n");
        const emails = data
            .filter((line) => line.toLowerCase().includes("email") || line.includes("@"))
            .map((line) => line.replace("email:", "").trim());
        setListEmail(emails);
        console.log("emails---", emails)
        getContactPerson(data);
        return emails
    };

    const getContactPerson = (data) => {
        data = recognizedText.split("\n");
        const contactPersons = data
            .filter((line) => line.toLowerCase().includes("contact person"))
            .map((line) => line.replace("Contact Person:", "").trim());
        setListContactPerson(contactPersons);
        console.log("contactPersons---", contactPersons)
        getProduct(data);
    };

    const getProduct = (data) => {
        data = recognizedText.split("\n");
        const products = data.filter((line) => line.toLowerCase().includes("products")).map((line) => line.trim());
        setListProductService(products);
        console.log("products---", products)
        createList();
    };

    const createList = () => {
        const maxSize = Math.max(
            listName.length,
            listAddress.length,
            listContact.length,
            listEmail.length,
            listContactPerson.length,
            listProductService.length
        );

        const makeSizedList = (list) => {
            while (list.length < maxSize) list.push("");
            return list;
        };

        const names = makeSizedList([...listName]);
        const addresses = makeSizedList([...listAddress]);
        const contacts = makeSizedList([...listContact]);
        const emails = makeSizedList([...listEmail]);
        const contactPersons = makeSizedList([...listContactPerson]);
        const products = makeSizedList([...listProductService]);
        setListBlocks([])
        const listBlocks = names.map((_, i) => ({
            name: names[i],
            address: addresses[i],
            contact: contacts[i],
            email: emails[i],
            contact_person: contactPersons[i],
            products: products[i],
        }));

        setListBlocks(listBlocks);
        console.log("LISTBLOCKSSSSS", listBlocks)
        setTimeout(() => {
            navigation.navigate("Type3SaveScreen", {
                extractedData: listBlocks,
                croppedImageUri: filePath,
                recognizedText: recognizedText,
            });
        }, 500);
    }

    return (
        //new updated code at 08-01-2025 after 5 pm
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Type3 Process</Text>
            <Button title="Select & Crop Image" onPress={() => setModalVisible(true)} />
            <Image
                source={{ uri: croppedImageUri }}
                style={styles.syncIcon}
            />
            <Button title="Run OCR" onPress={processOCR} disabled={!croppedImageUri} />
            {recognizedText ? <Text style={styles.text}>Recognized Text: {recognizedText}</Text> : null}

            <Modal
                transparent={true}
                animationType="fade"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ backgroundColor: 'white', padding: 30, borderRadius: 10, alignItems: 'center' }}>
                        <Text>Select an option:</Text>
                        <TouchableOpacity onPress={openCamera} style={{ marginVertical: 10 }}>
                            <Text style={{ color: 'green', fontSize: 18 }}>Open Camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={openGallery} style={{ marginVertical: 10 }}>
                            <Text style={{ color: 'green', fontSize: 18 }}>Open Gallery</Text>
                        </TouchableOpacity>
                        <View style={{ width: 120, height: 40, marginTop: 15, alignItems: 'center' }}>
                            <Button title="Cancel" onPress={() => setModalVisible(false)} />
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    text: {
        marginTop: 10,
        fontSize: 16,
        borderWidth: 1,
        borderRadius: 5,
        marginVertical: 5,
        padding: 10
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    syncIcon: {
        margin: 10,
        width: "100%",
        height: 300,
        resizeMode: 'contain'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
})
export default Type3ProcessScreen;