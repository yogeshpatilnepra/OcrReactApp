import { Image } from "react-native-reanimated/lib/typescript/Animated"

// const API_KEY = "AIzaSyAQGAu4mfmorOnpFaBRXCxngdJW8BahCGk"
const APi_URL = "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyAQGAu4mfmorOnpFaBRXCxngdJW8BahCGk"

export const getTextFromtheImage = async (image) => {
    const data = {
        requests: [
            {
                image: {
                    content: image,
                },
                features: [
                    {
                        type: 'TEXT_DETECTION',
                        maxResults: 1,
                    },
                ],
            },
        ],
    };

    const res = await fetch(
        APi_URL, {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }
    )
    const json = await res.json();
    return json
}