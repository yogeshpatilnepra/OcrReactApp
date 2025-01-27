import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import { useRef, useState } from "react";
import { ActivityIndicator, Alert, Button, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import ImageCropPicker from "react-native-image-crop-picker";

const API_KEY = "AIzaSyBYVOs6UpcpK4ERxpwEpA-xp2UbYd-rJQg";
export default function Gemini() {
    const [croppedImageUri, setCroppedImageUri] = useState('');
    const [responseText, setResponseText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const genAI = new GoogleGenerativeAI(API_KEY);

    const openCamera = () => {
        ImageCropPicker.openCamera({
            cropping: true,
        })
            .then(image => {
                setCroppedImageUri(image.path);
                setModalVisible(false);
            })
            .catch(error => Alert.alert('Error', error.message || 'Failed to open camera'));
    };

    const openGallery = () => {
        ImageCropPicker.openPicker({
            cropping: true,
        })
            .then(image => {
                setCroppedImageUri(image.path);
                setModalVisible(false);
            })
            .catch(error => Alert.alert('Error', error.message || 'Failed to open gallery'));
    };

    const handleSendToAPI = async () => {
        if (!croppedImageUri) {
            Alert.alert('Error', 'Please select an image first');
            return;
        }

        try {
            setLoading(true);

            //new code for send the image in api
            const question = "Extract the 4 digit Number Name & Address of the company,Contact Person,Phone/Mobile/Web./Email,Product Name and give the answer with json format and set name and address both values in one company_name_address,contact person values in contact_person,phone and email both values in phone_email,and product name in product_name in this format in json .";
            await getImageData(croppedImageUri, question);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            Alert.alert('Error', error.message || 'Failed to process the image');
        }
    };
    //code for Send the Image in to the api
    const getImageData = async (uri, question) => {
        try {
            const base64Image = await convertToBase64(uri);

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
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyBYVOs6UpcpK4ERxpwEpA-xp2UbYd-rJQg',
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
                    const generatedText = firstCandidate.content.parts[0].text;
                    setResponseText("Result : \n" + generatedText);
                    console.log("generatedText", generatedText)
                }
            }

        } catch (error) {
            console.error(error);
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

    return (
        <SafeAreaView style={styles.mainContainer}>
            <View style={styles.container1}>
                <View style={styles.header}>
                    <Button title="Select & Crop Image" onPress={() => setModalVisible(true)} />
                    <View style={styles.headingContainer}>
                        <Text style={styles.heading}>Google Gemini</Text>
                    </View>
                </View>

                {croppedImageUri ? (
                    <Image source={{ uri: croppedImageUri }} style={styles.imagePreview} />
                ) : (
                    <Text style={styles.noImageText}>No image selected</Text>
                )}

                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSendToAPI}
                    disabled={loading}>
                    {loading ? (
                        <ActivityIndicator size={'small'} color={'#FFFFFF'} />
                    ) : (
                        <Text style={styles.sendButtonText}>Send to API</Text>
                    )}
                </TouchableOpacity>

                {responseText && (
                    <ScrollView>
                        <View style={styles.responseContainer}>
                            <Text style={styles.responseHeading}>{responseText}</Text>
                        </View>
                    </ScrollView>
                )}
            </View>

            <Modal
                transparent={true}
                animationType="fade"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalText}>Select an option:</Text>
                        <TouchableOpacity onPress={openCamera} style={styles.modalOption}>
                            <Text style={styles.modalOptionText}>Open Camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={openGallery} style={styles.modalOption}>
                            <Text style={styles.modalOptionText}>Open Gallery</Text>
                        </TouchableOpacity>
                        <Button title="Cancel" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        padding: 10,
    },
    container1: {
        flex: 1,
        alignItems: 'center',
    },
    header: {
        marginBottom: 20,
        alignItems: 'center',
    },
    headingContainer: {
        marginTop: 10,
    },
    heading: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    imagePreview: {
        margin: 10,
        width: "100%",
        height: 300,
        resizeMode: 'contain'
        // width: '90%',
        // height: 300,
        // marginBottom: 20,
        // borderRadius: 10,
    },
    noImageText: {
        fontSize: 16,
        color: '#555',
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
    },
    responseContainer: {
        marginTop: 20,
        backgroundColor: '#EFEFEF',
        padding: 10,
        borderRadius: 10,
        width: '90%',
    },
    responseHeading: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    responseText: {
        fontSize: 14,
        color: '#333',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 30,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
    },
    modalOption: {
        marginVertical: 10,
    },
    modalOptionText: {
        fontSize: 18,
        color: 'green',
    },
    syncIcon: {
        margin: 10,
        width: "100%",
        height: 300,
        resizeMode: 'contain'
    },
});