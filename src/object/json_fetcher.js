class JsonFetcher {
    static async getJsonObject(path) {
        var jsonObject = {};
        const response = await fetch(path);

        if (response.ok) {
            jsonObject = await response.json();
        }

        return jsonObject;
    }
}

