import { CurrentRenderContext, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, FlatList, Image, LogBox, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ImageCropPicker from "react-native-image-crop-picker";
import MLKit from "react-native-mlkit-ocr";
import Type1 from "../models/Type1";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import { sayHello } from "../CommonApiCode/ApiCallCode";

LogBox.ignoreAllLogs();
const Type1ProcessScreen = () => {
    const navigation = useNavigation();
    const [croppedImageUri, setCroppedImageUri] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filePath, setFilePath] = useState('');

    //new code


    const [recognizedText, setRecognizedText] = useState('');

    // set the data to the new lists 
    const [listBlocks, setListBlocks] = useState([]);
    const [listNameAddress, setListNameAddress] = useState([]);
    const [listContactPerson, setListContactPerson] = useState([]);
    const [listPhoneEmail, setListPhoneEmail] = useState([]);
    const [listProductName, setListProductName] = useState([]);
    //ocr start code

    const handleSendToAPI = async () => {
        if (!croppedImageUri) {
            Alert.alert('Error', 'Please select an image first');
            return;
        }

        try {
            setLoading(true);
            //new code for send the image in api
            const question = "Extract the Name & Address of the company,Contact Person,Phone/Mobile/Web./Email,Product Name and give the answer with json format and set name and address both values in one company_name_address,contact person values in contact_person,phone and email both values in phone_email,and product name in product_name in this format in json .";

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

                    // Accessing the text from the parts array
                    if (firstCandidate.content.parts && firstCandidate.content.parts.length > 0) {
                        const generatedText = response.data.candidates[0]?.content?.parts?.[0]?.text || "";
                        setRecognizedText("" + generatedText);
                        const jsonMatch = generatedText.match(/\[.*\]/s); // Match anything between [ and ]
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

    const convertToBase64 = async (uri) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result.split(',')[1]); // Get base64 string
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
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

    useEffect(() => {

    })

    //new data
    const getName = (generateContent) => {

        const generatedText = JSON.parse(generateContent)
        const nameAddressList = generatedText.map(item => item.company_name_address);
        const contactPersonList = generatedText.map(item => item.contact_person);
        const phoneEmailList = generatedText.map(item => item.phone_email);
        const productNameList = generatedText.map(item => item.product_name);

        setListNameAddress(nameAddressList);
        setListContactPerson(contactPersonList);
        setListPhoneEmail(phoneEmailList);
        setListProductName(productNameList);
        createList();
    }

    useEffect(() => {
        console.log("Updated State: ", {
            listNameAddress,
            listContactPerson,
            listPhoneEmail,
            listProductName
        });
    }, [listNameAddress, listContactPerson, listPhoneEmail, listProductName]); 

    const createList = () => {
        make3Size(listNameAddress);
        make3Size(listContactPerson);
        make3Size(listPhoneEmail);
        make3Size(listProductName);

        setListBlocks([])
        const listBlocks = [
            new Type1(listNameAddress[0], listContactPerson[0], listPhoneEmail[0], listProductName[0]),
            new Type1(listNameAddress[1], listContactPerson[1], listPhoneEmail[1], listProductName[1]),
            new Type1(listNameAddress[2], listContactPerson[2], listPhoneEmail[2], listProductName[2]),
            new Type1(listNameAddress[3], listContactPerson[3], listPhoneEmail[3], listProductName[3]),
            new Type1(listNameAddress[4], listContactPerson[4], listPhoneEmail[4], listProductName[4]),
            new Type1(listNameAddress[5], listContactPerson[5], listPhoneEmail[5], listProductName[5]),
            new Type1(listNameAddress[6], listContactPerson[6], listPhoneEmail[6], listProductName[6]),
        ];

        setListBlocks([...listBlocks]);
        setTimeout(() => {
            navigation.navigate('Type1SaveScreen', {
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

    return (
        //new updated code at 08-01-2025 after 5 pm
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Type1 Process</Text>
            <TouchableOpacity
                style={styles.sendButton}
                onPress={() => setModalVisible(true)}
            >
                {
                    <Text style={styles.sendButtonText}>Select & Crop Image</Text>
                }
            </TouchableOpacity>
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
})
export default Type1ProcessScreen;