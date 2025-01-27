import { CurrentRenderContext, useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Button, Image, Keyboard, KeyboardAvoidingView, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ImageCropPicker from "react-native-image-crop-picker";
import MLKit from "react-native-mlkit-ocr";
import axios from "axios";
import Type5 from "../models/Type5";

const Type5ProcessScreen = () => {
    const [recognizedText, setRecognizedText] = useState('');
    const [extractedData, setExtractedData] = useState([])
    const navigation = useNavigation();
    const [croppedImageUri, setCroppedImageUri] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const [listBlocks, setListBlocks] = useState([]);
    const [listName, setlistName] = useState([]);
    const [listFactory, setlistFactory] = useState([]);
    const [listOffice, setlistOffice] = useState([]);
    const [listContact, setlistContact] = useState([]);
    const [listMobile, setlistMobile] = useState([]);
    const [listEmail, setlistEmail] = useState([]);
    const [listlistProduct, setlistProduct] = useState([]);

    const [loading, setLoading] = useState(false);
      const [filePath, setFilePath] = useState('');

    //open camera function
    const openCamera = () => {
        ImageCropPicker.openCamera({
            cropping: true,
        }).then(image => {
            setCroppedImageUri(image.path);
        });
        setModalVisible(false);
    };

    //open gallery function
    const openGallery = () => {
        ImageCropPicker.openPicker({
            cropping: true,
        }).then(image => {
            setCroppedImageUri(image.path);
        });
        setModalVisible(false);
    };

    //ocr start code
    const handleSendToAPI = async () => {
        if (!croppedImageUri) {
            Alert.alert('Error', 'Please select an image first');
            return;
        }

        try {
            setLoading(true);
            //new code for send the image in api
            const question = "Extract the Name,Factory,Office,Contact,Mobile,Email,Website,Product and give the answer with json format and Name values in one name,factory values in factory ,office values in office,and contact values in contact,mobile values in mobile,email and website both values in email,product values in product, in this format in json";

            try {
                const base64Image = await convertToBase64(croppedImageUri);
                setFilePath(croppedImageUri)
                const content = {
                    "contents": [{
                        "parts": [
                            { "text": question },
                            {
                                "inline_data": { "mime_type": "image/jpeg", "data": base64Image }
                            }
                        ]
                    }]
                }

                const response = await axios.post(
                    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyCwqyoPlKU6yjI0fudnPBS-205RiiEv5Pg',
                    content,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (response.data.candidates && response.data.candidates.length > 0) {

                    const firstCandidate = response.data.candidates[0];

                    if (firstCandidate.content.parts && firstCandidate.content.parts.length > 0) {
                        const generatedText = response.data.candidates[0]?.content?.parts?.[0]?.text || "";
                        setRecognizedText("" + generatedText);
                        const jsonMatch = generatedText.match(/\[.*\]/s);
                        if (!jsonMatch) {
                            throw new Error("No valid JSON found in the response");
                        }
                        const jsonText = jsonMatch[0];
                        getName(jsonText)
                    }
                }

            } catch (error) {
                console.error(error);
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            Alert.alert('Error', error.message || 'Failed to process the image');
        }
    };
    const getName = (generateContent) => {

        const generatedText = JSON.parse(generateContent)
        const nameList = generatedText.map(item => item.name);
        const factoryList = generatedText.map(item => item.factory);
        const officeList = generatedText.map(item => item.office);
        const contactList = generatedText.map(item => item.contact);
        const mobileList = generatedText.map(item => item.mobile);
        const emailList = generatedText.map(item => item.email);
        const productList = generatedText.map(item => item.product);

        setlistName(nameList);
        setlistFactory(factoryList);
        setlistOffice(officeList);
        setlistContact(contactList);
        setlistMobile(mobileList);
        setlistEmail(emailList);
        setlistProduct(productList);
        createList();
    }

    const createList = () => {
        make3Size(listName);
        make3Size(listFactory);
        make3Size(listOffice);
        make3Size(listContact);
        make3Size(listMobile);
        make3Size(listEmail);
        make3Size(listlistProduct);

        setListBlocks([])
        const listBlocks = [
            new Type5(listName[0], listFactory[0], listOffice[0], listContact[0], listMobile[0], listEmail[0], listlistProduct[0]),
            new Type5(listName[1], listFactory[1], listOffice[1], listContact[1], listMobile[1], listEmail[1], listlistProduct[1]),
            new Type5(listName[2], listFactory[2], listOffice[2], listContact[2], listMobile[2], listEmail[2], listlistProduct[2]),
            new Type5(listName[3], listFactory[3], listOffice[3], listContact[3], listMobile[3], listEmail[3], listlistProduct[3]),
            new Type5(listName[4], listFactory[4], listOffice[4], listContact[4], listMobile[4], listEmail[4], listlistProduct[4]),
            new Type5(listName[5], listFactory[5], listOffice[5], listContact[5], listMobile[5], listEmail[5], listlistProduct[5]),
            new Type5(listName[6], listFactory[6], listOffice[6], listContact[6], listMobile[6], listEmail[6], listlistProduct[6]),
        ];

        setListBlocks([...listBlocks]);
        setTimeout(() => {
            navigation.navigate('Type5SaveScreen', {
                extractedData: listBlocks,
                croppedImageUri: filePath,
                recognizedText: recognizedText,
            });
        }, 2000);
    };

    const make3Size = (list) => {
        while (list.length < 7) {
            list.push('');
        }
    };

    const convertToBase64 = async (uri) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const extractData = (lines) => {
        let currentEntry = {};

        const type5 = new Type5();

        lines.forEach((line) => {
            const cleanLine = line.trim();

            if (cleanLine.toLowerCase().includes('mfg.') || cleanLine.toLowerCase().includes('trading in')) {
                currentEntry.product = cleanLine;
            } else if (cleanLine.includes('@')) {
                currentEntry.email = cleanLine;
            } else if (/^\d{10}$/.test(cleanLine)) {
                if (!currentEntry.mobile) {
                    currentEntry.mobile = cleanLine;
                } else {
                    currentEntry.contact = cleanLine;
                }
            } else if (cleanLine.includes(',')) {
                if (!currentEntry.factory) {
                    currentEntry.factory = cleanLine;
                } else {
                    currentEntry.office = cleanLine;
                }
            } else if (cleanLine.length > 3) {
                if (!currentEntry.name) {
                    currentEntry.name = cleanLine;
                } else if (!currentEntry.contactPerson) {
                    currentEntry.contactPerson = cleanLine;
                }
            }

            if (
                currentEntry.name &&
                currentEntry.factory &&
                currentEntry.contact &&
                currentEntry.email &&
                currentEntry.mobile &&
                currentEntry.product
            ) {
                extractedData.push({ ...currentEntry });
                currentEntry = {};
            }
            console.log("currentEntry.name", currentEntry.name)
            console.log("currentEntry.factory", currentEntry.factory)
            console.log("currentEntry.contact", currentEntry.contact)
            console.log("currentEntry.email", currentEntry.email)
            console.log("currentEntry.mobile", currentEntry.mobile)
            console.log("currentEntry.product", currentEntry.product)
        });
        // console.log("EDATTAAA---->", extractedData)
        return extractedData;
    };
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Type5 Process</Text>
            <Button title="Select & Crop Image" onPress={() => setModalVisible(true)} />
            {/* {croppedImageUri ? <Text style={styles.filePath}>File Path: {croppedImageUri}</Text> : null} */}
            <Image
                source={{ uri: croppedImageUri }}
                style={styles.syncIcon}
            />
            <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendToAPI}
                disabled={loading}>
                {loading ? (
                    <ActivityIndicator size={'small'} color={'#FFFFFF'} />
                ) : (
                    <Text style={styles.sendButtonText}>Run OCR</Text>
                )}
            </TouchableOpacity>
            {/* <Button title="Run OCR" onPress={processOCR} disabled={!croppedImageUri} /> */}
            {recognizedText ? <Text style={styles.text}>Recognized Text: {recognizedText}</Text> : null}
            {/* <Button title="Proceed to Save Screen" onPress={navigateToSaveScreen} disabled={!recognizedText} /> */}

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
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    filePath: {
        marginTop: 10,
        color: 'gray',
    },
    text: {
        marginTop: 10,
        fontSize: 16,
        borderWidth: 1,
        borderRadius: 5,
        marginVertical: 5,
        padding: 10
    },
    syncIcon: {
        margin: 10,
        width: "100%",
        height: 300,
        resizeMode: 'contain'
    },
    sendButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    sendButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        alignSelf: 'center'
    },
});
export default Type5ProcessScreen;