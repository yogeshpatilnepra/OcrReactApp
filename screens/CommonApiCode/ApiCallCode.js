import { CommonActions, useNavigation } from "@react-navigation/native";
import { Alert, Text, View } from "react-native";

export function sayHello() {
    console.log("click workd")
}

const ApiCallCode = () => {
    const navigation = useNavigation();

    const API_BASE_URL = 'https://ims-api.nepra.co.in/api/company/v1/';
    const API_ENDPOINTS = {
        TABLE_OCR: 'directory_table_extraction',
        SAVE_JSON: 'save-gspma-data',
        SYNC_DATA: 'get-gspma-data',
        GET_EXCEL: 'export-excel',
    };

   const saveJson = async (unorganizedJson, jsonData, appFilePath, filePath, type) => {

        try {

            const requestData = {};
            const addImageToRequest = (request, title, url) => {
                if (url && !url.startsWith("http")) {
                    request[title] = url;
                }
            };

            requestData["json_data"] = jsonData;
            requestData["type"] = type;

            if (unorganizedJson) {
                requestData["unorganize_json"] = unorganizedJson;
            }

            if (appFilePath) {
                addImageToRequest(requestData, "img", appFilePath);
            }
            if (filePath) {
                addImageToRequest(requestData, "excel_file", filePath);
            }

            console.log("Type1DATAAAAA", requestData)
            const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.SAVE_JSON}`, requestData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status === 200) {
                Alert.alert("Success", response.data.msg);
                navigation.dispatch(CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Dashboard' }]
                }))

                return response.data.msg;
            } else {
                Alert.alert("Error", response.data.msg);
                throw new Error(response.data.msg);
            }
        }
        catch (error) {
            Alert.alert("Save Data Error:", error.message)
        }
    }

    return (
        <View>
            <Text> This is the Common Code for api call</Text>
        </View >
    )
}
export default ApiCallCode;