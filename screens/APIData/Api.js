import { useEffect, useState } from "react"
import { FlatList, Text, View } from "react-native"

const Api = () => {
    const [data, setData] = useState([])
    const getApiData = async () => {
        const url = "https://jsonplaceholder.typicode.com/posts"
        const result = await fetch(url)
        result = await result.json()
        setData(result)
    }

    useEffect(() => {
        getApiData()
    })

    return (
        <View>
            {
                data.length ?
                    <FlatList
                        data={data}
                        renderItem={({ item }) => <View>
                            <Text style={{ fontSize: 24 }}>{item.id}</Text>
                        </View>}
                    />
                    : null
            }
        </View>
    )
}

export default Api