import { CurrentRenderContext, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Alert, Button, FlatList, Image, LogBox, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ImageCropPicker from "react-native-image-crop-picker";
import MLKit from "react-native-mlkit-ocr";
import Type2 from "../models/Type2";

const Type2ProcessScreen = () => {
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
    const [listWebsite, setListWebsite] = useState([]);
    const [listContactPerson, setListContactPerson] = useState([]);
    const [listProductService, setListProductService] = useState([]);

    //ocr start code
    const processOCR = async () => {
        const type2 = new Type2();
        try {
            const result = await MLKit.detectFromFile(croppedImageUri);
            const recognizedText = result.map(block => block.text).join('\n');

            setRecognizedText(recognizedText);
            setFilePath(croppedImageUri)
            const lines = recognizedText.split("\n")
            const data = extractNames(recognizedText)
            type2.setData(data)
            setExtractedData(type2)
            Alert.alert('OCR Complete', 'Text recognized successfully.');
            setExtractedData([]);
        } catch (error) {
            console.error('Error with OCR:', error.message);
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

    const extractNames = (data) => {
        data = recognizedText.split('\n');
        const listName = [];
        const regexPattern = /^[A-Z.()&\s/-]+$/;

        data.forEach((line) => {
            if (
                regexPattern.test(line) && // Match the regex pattern
                line.includes(' ') && // Check if the line contains a space
                !line.toLowerCase().includes('india') // Exclude lines containing "india"
            ) {
                listName.push(line);
            }
        });
        // console.log("listName---", listName)
        getAddress(data);
        setListName(listName);
        return listName;
    };

    const getAddress = (data) => {
        data = recognizedText.split('\n');
        let isNameFound = false;
        let isAddressComplete = false;
        let ADDRESS = '';
        const listAddress = [];

        const regexPattern = /^(?:[A-Z\s./-]+|\b[0-9A-Z][\w\s&/]*\b)$/;

        data.forEach((line) => {
            const matchesPattern = regexPattern.test(line);

            if (matchesPattern && line.includes(' ')) {
                isNameFound = true;
                isAddressComplete = false;
                ADDRESS = '';
            } else if (isNameFound && !isAddressComplete) {
                if (line.toLowerCase().includes('tel') || line.toLowerCase().includes('mobile')) {
                    isAddressComplete = true;
                    isNameFound = false;
                    listAddress.push(ADDRESS);
                } else {
                    ADDRESS += line;
                }
            }
        });
        getTel(data);
        // console.log("listAddress---", listAddress)
        setListAddress(listAddress);
        return listAddress;
    };

    const getTel = (data) => {
        data = recognizedText.split('\n');
        const listContact = [];

        data.forEach((line) => {
            if (line.toLowerCase().includes('tel') || line.toLowerCase().includes('mobile')) {
                const value = line.replace(/tel|:/gi, '').trim();
                listContact.push(value);
            }
        });
        getEmail(data);
        // console.log("listContact---", listContact)
        setListContact(listContact);
        return listContact;
    };

    const getEmail = (data) => {
        data = recognizedText.split('\n');
        const listEmail = [];

        data.forEach((line) => {
            if (line.toLowerCase().includes('email') || line.includes('@')) {
                const value = line.replace(/email:/gi, '').trim();
                listEmail.push(value);
            }
        });
        getWebsite(data);
        // console.log("listEmail---", listEmail)
        setListEmail(listEmail);
        return listEmail
    };

    const getWebsite = (data) => {
        data = recognizedText.split('\n');
        const listWebsite = [];
        data.forEach((line) => {
            if (line.toLowerCase().includes('website') || line.toLowerCase().includes('www')) {
                const value = line.replace(/website|:/gi, '').trim();
                listWebsite.push(value);
            }
        });
        getContactPerson(recognizedText);
        // console.log("listWebsite---", listWebsite)
        setListWebsite(listWebsite);
        return listWebsite;
    };


    const getContactPerson = (data) => {

        data = recognizedText.split('\n');
        const listContactPerson = [];

        data.forEach((line) => {
            if (line.toLowerCase().includes('contact person') || line.toLowerCase().includes('contact')) {
                const value = line.replace(/Contact Person|:/gi, '').trim();
                listContactPerson.push(value);
            }
        });

        getProductService(data);
        // console.log("listContactPerson---", listContactPerson)
        setListContactPerson(listContactPerson);
        return listContactPerson;
    };

    const getProductService = (data) => {
        data = recognizedText.split('\n');
        let isServiceStart = false;
        let SERVICE = '';
        const listProductService = [];
        data.forEach((line, index) => {
            if (line.toLowerCase().includes('contact person') || line.toLowerCase().includes('contact')) {
                isServiceStart = true;
            } else if (isServiceStart) {
                const regexPattern = /^[A-Z\s.-]+$/;
                if ((regexPattern.test(line) && line.includes(' ')) || index === data.length - 1) {
                    isServiceStart = false;

                    if (index === data.length - 1) {
                        const value = SERVICE.replace('Product Service', '').replace(':', '').trim();
                        listProductService.push(value);
                        SERVICE = '';
                    }
                } else {
                    SERVICE += line;
                }
            } else if (SERVICE !== '') {
                const value = SERVICE.replace('Product Service', '').replace(':', '').trim();
                SERVICE = '';
                isServiceStart = false;
                listProductService.push(value);
            }
        })
        // console.log("listProductService---", listProductService)
        setListProductService(listProductService);
        createList();
        return listProductService;
    };

    const createList = () => {
        make3Size(listName);
        make3Size(listAddress);
        make3Size(listContact);
        make3Size(listEmail);
        make3Size(listWebsite);
        make3Size(listContactPerson);
        make3Size(listProductService);
        setListBlocks([])
        const listBlocks = [
            new Type2(listName[0], listAddress[0], listContact[0], listEmail[0], listWebsite[0], listContactPerson[0], listProductService[0]),
            new Type2(listName[1], listAddress[1], listContact[1], listEmail[1], listWebsite[1], listContactPerson[1], listProductService[1]),
            new Type2(listName[2], listAddress[2], listContact[2], listEmail[2], listWebsite[2], listContactPerson[2], listProductService[2]),
            new Type2(listName[3], listAddress[3], listContact[3], listEmail[3], listWebsite[3], listContactPerson[3], listProductService[3]),
        ];

        setListBlocks([...listBlocks]);
        console.log("LISTBLOCKSSS", listBlocks)
        setTimeout(() => {
            navigation.navigate('Type2SaveScreen', {
                extractedData: listBlocks,
                croppedImageUri: filePath,
                recognizedText: recognizedText,
            });
        }, 500);
    };

    const make3Size = (list) => {
        while (list.length < 4) {
            list.push('');
        }
    };

    return (
        //new updated code at 08-01-2025 after 5 pm
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Type2 Process</Text>
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
export default Type2ProcessScreen;