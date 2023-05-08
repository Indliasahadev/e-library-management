let fileReader = new FileReader()

function showFile(input) {
    let file = input.files[0]

    fileReader.readAsText(file)
    fileReader.onload = function () {
        // console.log(fileReader.result)
        let arr = getArray(fileReader.result)
        let headinsArr = []
        let item = {
            book_id: [],
            books_count: [],
            isbn: [],
            authors: [],
            original_publication_year: [],
            original_title: [],
            title: [],
            language_code: [],
            image_url: [],
            small_image_url1: []
        }
        for (let i = 0; i < arr.length; i += 23){
            console.log(arr[i+9])
            item[headinsArr[i]]
            item.book_id.push(arr[i])
            item.books_count.push(arr[i+4])
            item.isbn.push(arr[i+5])
            item.authors.push(arr[i+7])
            item.original_publication_year.push(arr[i+8])
            item.original_title.push(arr[i+9])
            item.title.push(arr[i+10])
            item.language_code.push(arr[i+11])
            item.image_url.push(arr[i+21])
            item.small_image_url1.push(arr[i+22])

        }

        for (let i = 0; i < 23; i++){
            // console.log(item.title[i])
        }
        console.log(headinsArr)
        console.log(item.book_id.length)
        let JSONitem = JSON.stringify(item)
        // console.log(JSONitem)
        return JSONitem
        // console.log(arr)
        // alert(fileReader.result)
    }
    fileReader.onerror = function () {
        alert(fileReader.error)
        return fileReader.error
    }
}

function getArray(file){
    let arr = file.split(',')
    return arr
}