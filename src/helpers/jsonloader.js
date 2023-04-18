class JsonLoader {
    get(url) {
        var self = this;
        fetch(url)
            .then((response) => response.json())
            .then(function (data) { self.imageData = data }).catch(function (doh) {
                 alert("error");
            });
        //if (response.ok) return await response.json();

        console.log("data0" + this.imageData);
        return this.imageData;
        //return {};
    }



    //alert(data) {
    //    console.log(data);
    //}
}