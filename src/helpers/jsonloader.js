export class JsonLoader {
    get(url) {
        var self = this;
        fetch(url)
            .then((response) => response.json())
            .then(function (data) { self.jsonData = data }).catch(function (doh) {
                 alert("error");
            });

        return this.jsonData;
    }
}