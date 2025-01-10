import { CurrentRenderContext, useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Alert, Button, Image, Keyboard, KeyboardAvoidingView, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ImageCropPicker from "react-native-image-crop-picker";
import MLKit from "react-native-mlkit-ocr";
import axios from "axios";
import Type5 from "../models/Type5";

const Type5ProcessScreen = () => {

    // const [filePath, setFilePath] = useState('');
    const [recognizedText, setRecognizedText] = useState('');
    const [extractedData, setExtractedData] = useState([])
    const navigation = useNavigation();
    const [croppedImageUri, setCroppedImageUri] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

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
    const processOCR = async () => {
        const type5 = new Type5();
        try {
            const result = await MLKit.detectFromFile(croppedImageUri);
            const recognizedText = result.map(block => block.text).join('\n');
            setRecognizedText(recognizedText);
            const lines = recognizedText.split("\n")
            const data = extractData(lines)
            type5.setData(data)
            setExtractedData(type5)
            Alert.alert('OCR Complete', 'Text recognized successfully.');
            navigation.navigate('Type5SaveScreen', { extractedData: data, recognizedText, croppedImageUri });
            setExtractedData([]);
        } catch (error) {
            console.error('Error with OCR:', error);
        }
    };

    //old and working code without contact person name

    const extractData = (lines) => {
        let currentEntry = {};
        let currentBlock = {
            name: "",
            factory: "",
            office: "",
            contact: "",
            mobile: "",
            email: "",
            product: ""
        }

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
        });
        // console.log("CuurentBLOCKK", currentBlock)
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
            <Button title="Run OCR" onPress={processOCR} disabled={!croppedImageUri} />
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
        padding:10    
    },
    syncIcon: {
        margin: 10,
        width: "100%",
        height: 300,
        resizeMode: 'contain'
    }
});
export default Type5ProcessScreen;