const container = document.querySelector(".container");
const input = document.getElementById("input");
const quantity = document.querySelector("#quantity");
const price = document.querySelector("#price");
const discription = document.querySelector("#discription");
const imgurl = document.getElementById("imgurl");
const addbtn = document.querySelector("#addbtn");
const bigcontainer = document.querySelector(".bigcontainer");
let tasktable = document.querySelector(".task-table");
let count = 0;
let products = [];

bigcontainer.style.display = "none";

const form = document.querySelector("form");



function addRow(taskObj) {
    count++;
  container.style.display = "block";
   tasktable.style.display = "block";
    const tr = document.createElement("tr");
    tr.className = `task${count}`;

    const tdName = document.createElement("td");
    tdName.innerText = taskObj.name;
    tdName.name = "product_name";

    const tdQty = document.createElement("td");
    tdQty.name = "product_quantity";
    tdQty.innerText = taskObj.quantity;

    const tdPrice = document.createElement("td");
    tdPrice.innerText = taskObj.price;
    tdPrice.name = "product_price";

    const tdDesc = document.createElement("td");
    tdDesc.innerText = taskObj.discription;
    tdDesc.name = "product_discription"

    const tdImg = document.createElement("td");
    const img = document.createElement("img");
    img.src = taskObj.image || "fallback.jpg"; // agar image URL missing ho to default
    // img.alt = taskObj.name;
    img.style.width = "50px";
    img.style.height = "50px";
    tdImg.appendChild(img);

    const tdEdit = document.createElement("td");
    const editBtn = document.createElement("button");
    editBtn.className = "editbtns";
    editBtn.innerText = "Edit";
    tdEdit.appendChild(editBtn);

    const tdDelete = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete";
    tdDelete.appendChild(deleteBtn);

    tr.appendChild(tdImg);
    tr.appendChild(tdName);
    tr.appendChild(tdQty);
    tr.appendChild(tdPrice);
    tr.appendChild(tdDesc);
    tr.appendChild(tdEdit);
    tr.appendChild(tdDelete);
    container.appendChild(tr);


    deleteBtn.addEventListener('click', () => {
        let row = deleteBtn.parentElement.parentElement;
        const productName = row.querySelector("td:nth-child(2)").innerText.trim(); // Assuming product name is in 2nd column
        console.log(productName);
        fetch(`/products/${encodeURIComponent(productName)}`, {
            method: 'DELETE',
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                location.reload(); // reload the updated product list
            });
    });

    console.log(editBtn);
    editBtn.addEventListener("click", () => {
        const row = editBtn.parentElement.parentElement;
        const img = row.querySelector("td img");  // Image inside first td
          const cells = row.querySelectorAll("td");
          
        const imgSrc = img ? img.src : "";
        console.log("row", imgSrc);
      
       
        if (editBtn.innerText === "Save") {
            const oldname = editBtn.dataset.oldname;
        saveRowData(oldname, row, editBtn);
            return;
        }
    const oldname = cells[1].innerText.trim();
    editBtn.dataset.oldname = oldname;

        const imgCell = cells[0];
        const imgInput = document.createElement("input");
        imgInput.type = "text";
        imgInput.value = img.src;
        imgInput.style.width = "150px"; // clear old image
        imgCell.appendChild(imgInput);

        for (let i = 0; i <= 4; i++) {
            const currentValue = cells[i].innerText;
            const input = document.createElement("input");
            input.type = "text";
            input.value = currentValue;
            input.style.width = "100px";
            cells[i].innerText = "";
            cells[i].appendChild(input);
        }
        editBtn.innerText = "Save";
    });


    function saveRowData(oldname, row, button) {
        const cells = row.querySelectorAll("td");
        const inputs = row.querySelectorAll("input");
        console.log("olldname",oldname);
        console.log(cells.innerText);
        console.log(inputs);
        const newValues = [];
        let emptyField = false;

        inputs.forEach(input => {
            let value = input.value.trim();
            newValues.push(value);
            if (value === "") {
                emptyField = true;
            }
        });

        if (emptyField) {
            alert("Please fill all fields before saving.");
            return;
        }

        const newImgSrc = newValues[0];
          cells[0].innerHTML = "";
    const imgTag = document.createElement("img");
    imgTag.src = newImgSrc;
    imgTag.width = 50;
    imgTag.height = 50;
    cells[0].appendChild(imgTag);

        // Update cell values visually
        for (let i = 1; i < inputs.length; i++) {
            cells[i].innerText = newValues[i];
        }

        button.innerText = "Edit";

        // Extract image src (img is in the first <td>)
        const imgSrc = img.src;

        // Construct product object
        const updatedProduct = {
           old_name: oldname,
        product_img: newValues[0],
        product_name: newValues[1],
        product_quantity: newValues[2],
        product_price: newValues[3],
        product_discription: newValues[4]
        };
        console.log(updatedProduct);
        // Send PUT request to backend
        fetch('/edit', {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedProduct)
        })
            .then(res => res.json())
            .then(data => {
                console.log("Server response:", data);
                alert("Product updated successfully!");
            })
            .catch(err => {
                console.error("Update error:", err);
                alert("Failed to update product.");
            });
    }

}

addbtn.addEventListener("click", async function (event) {

     event.preventDefault(); 
    if (bigcontainer.style.display === "none") {
        bigcontainer.style.display = "flex";
        tasktable.style.display = "none";
        return;
    }
    else if (input.value.trim() === "" || quantity.value === "" || price.value === "" || discription.value.trim() === "") {
        alert("please enter all fields");
        return
    } else if (isNaN(quantity.value) || Number(quantity.value) <= 0) {
        alert("Quantity must be greater than 0");
        return
    } else if (isNaN(price.value) || Number(price.value) <= 0) {
        alert("Price must be greater than 0");
        return
    } else try {
        const response = await fetch("/admin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                product_name: input.value,
                product_quantity: quantity.value,
                product_price: price.value,
                product_discription: discription.value,
                product_img: imgurl.value
            })
        });
        const result = await response.json();
        console.log(result);
        if (response.ok) {
            alert("product add in json");
            let taskObj = {
                name: input.value,
                quantity: quantity.value,
                price: price.value,
                discription: discription.value,
                image: imgurl.value
            }
            console.log(taskObj);
            addRow(taskObj);
            
        } else {
            alert(result.message);
        }

    } catch (err) {
        console.error("product add :", err);
        alert("Product add nhi hora . Check your connection or server.");
    }

});



async function  loadproduct(){
    try {
        const response = await fetch("/products");
        if (!response.ok) throw new Error("Failed to fetch products");

        products = await response.json();

        if (products.length > 0) {
            tasktable.style.display = "block";

        }

        products.forEach(product => {
            // Fix property names to match taskObj used in addRow
            addRow({
                name: product.product_name,
                quantity: product.product_quantity,
                price: product.product_price,
                discription: product.product_discription,
                image: product.product_img
            });
        });
    } catch (err) {
        console.error("Error loading products: ", err);
    }

};
loadproduct();