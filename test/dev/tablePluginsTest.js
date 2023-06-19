export const add_pricing_table_plugin = {
    // @Required @Unique
    name: "pricingTable",
    // @Required
    display: "command",
  
    // @options
    // * You can also set from the button list
    // HTML title attribute (tooltip) - default: plugin's name
    title: "Add Pricing Table",
    // HTML to be append to button (icon)
    // Recommend using the inline svg icon. - default: "<span class="se-icon-text">!</span>"
    innerHTML: "+Click",
    // The class of the button. - default: "se-btn"
    // "se-code-view-enabled": It is not disable when on code view mode.
    // "se-resizing-enabled": It is not disable when on using resizing module.
    buttonClass: "",
  
    // @Required
    add: function (core, targetElement) {
      const context = core.context;
      context.addPricingTable = {
        targetButton: targetElement
      };
    },
    active: function (element) {
      if (!element) {
        this.util.removeClass(
          this.context.addPricingTable.targetButton,
          "active"
        );
      } else if (
        /^table$/i.test(element.nodeName) &&
        element.classList.contains("pricing-table")
      ) {
        this.util.addClass(this.context.addPricingTable.targetButton, "active");
        return true;
      }
  
      return false;
    },
  
    // Pricing table with input elements
    action: function (event) {
      let subTotalValue = 0;
  
      function getTaxAmount(taxPercent, subTotal, discAmt) {
        const finalAmt = subTotal - discAmt;
        const taxAmt = (finalAmt * taxPercent) / 100;
        return taxAmt;
      }
      function getDiscount(discPercent, subTotal) {
        const discAmt = (subTotal * discPercent) / 100;
        return discAmt;
      }
  
      function updateRowTotal(
        rows,
        rowId,
        cellId,
        value,
        taxInput,
        discountInput
      ) {
        let price = 0;
        let qty = 0;
  
        if (cellId === "tax" || cellId === "discount") {
          //if tax or discount is edited
          cellId === "tax"
            ? taxInput.setAttribute("value", value)
            : discountInput.setAttribute("value", value);
          updateGrandTotal(rows, taxInput, discountInput);
          return;
        }
        const nameInput = rows[rowId].cells[0].querySelector("input");
        const priceInput = rows[rowId].cells[1].querySelector("input");
        const qtyInput = rows[rowId].cells[2].querySelector("input");
        if (cellId === "0") {
          nameInput.setAttribute("value", value);
          return;
        } else if (cellId === "1") {
          //if price cell is edited
          price = value;
          priceInput.setAttribute("value", value);
          qty = rows[rowId].cells[2].querySelector("input").value;
        } else if (cellId === "2") {
          //if quantity cell is edited
          qty = value;
          qtyInput.setAttribute("value", value);
          price = rows[rowId].cells[1].querySelector("input").value;
        }
  
        const total = price * qty;
        rows[rowId].cells[3].textContent = total.toFixed(2);
  
        updateSubTotal(rows, taxInput, discountInput);
      }
  
      function updateSubTotal(rows, taxInput, discountInput) {
        subTotalValue = 0;
        for (let i = 0; i < rows.length - 5; i++) {
          const totalCell = rows[i].cells[3];
          subTotalValue += Number(totalCell.textContent);
        }
        const subTotal = rows[rows.length - 4].cells[3];
        subTotal.textContent = subTotalValue.toFixed(2);
        updateGrandTotal(rows, taxInput, discountInput);
      }
  
      function updateGrandTotal(rows, taxInput, discountInput) {
        const subTotalCell = rows[rows.length - 4].cells[3];
        const grandTotalCell = rows[rows.length - 1].cells[3];
        const discAmt = getDiscount(
          Number(discountInput.value),
          Number(subTotalCell.textContent)
        );
        const taxAmt = getTaxAmount(
          Number(taxInput.value),
          Number(subTotalCell.textContent),
          discAmt
        );
  
        grandTotalCell.textContent = (
          Number(subTotalCell.textContent) -
          discAmt +
          taxAmt
        ).toFixed(0);
      }
  
      function addNewRow(table) {
        const rows = table.tBodies[0].rows;
        let lastContentRowIndex = -1;
  
        // find index of last content row
        for (let i = rows.length - 1; i >= 0; i--) {
          const row = rows[i];
          if (!row.hasAttribute("contenteditable")) {
            lastContentRowIndex = i;
            break;
          }
        }
  
        const lastContentRow = rows[lastContentRowIndex];
        const newRow = document.createElement("tr");
  
        // set row content to be the same as the last content row but with incremented rowId
        newRow.innerHTML = lastContentRow.innerHTML.replace(
          /rowid="(\d+)"/g,
          (match, rowId) => `rowId="${Number(rowId) + 1}"`
        );
  
        // clear the values of the new row cells
        newRow.querySelectorAll("input").forEach((input) => {
          input.value = input.type === "text" ? "" : 0;
        });
        // newRow.querySelector('td[contenteditable]').textContent = '0';
  
        const deleteRowBtnCell = newRow.querySelector(".delete-row-btn");
        deleteRowBtnCell.innerHTML = '<i class="ri-delete-bin-line"></i>';
        deleteRowBtnCell.addEventListener("click", (e) => deleteRow(e, table));
  
        // insert new row after last content row
        table
          .querySelector("tbody")
          .insertBefore(newRow, lastContentRow.nextSibling);
  
        const taxInput = rows[rows.length - 2].cells[3].querySelector("input");
        const discountInput = rows[rows.length - 3].cells[3].querySelector(
          "input"
        );
        updateSubTotal(rows, taxInput, discountInput);
      }
  
      function deleteRow(e, table) {
        const deleteButton = e.target;
        const rows = table.tBodies[0].rows;
        //if only one content row exists, it shouldn't be deleted
        if (rows.length > 6) {
          const tableRow = deleteButton.parentNode.parentNode;
          tableRow.parentNode.removeChild(tableRow);
          const taxInput = rows[rows.length - 2].cells[3].querySelector("input");
          const discountInput = rows[rows.length - 3].cells[3].querySelector(
            "input"
          );
          updateSubTotal(rows, taxInput, discountInput);
        }
      }
  
      function restrictNegativeNums(inputEl) {
        const value = inputEl.value.trim();
  
        // If the value is empty, set the value to 0
        if (value === "") {
          inputEl.value = 0;
          return;
        }
  
        // Parse the value to a number. If the value is not a number, set the value to 0
        const numberValue = parseFloat(value);
  
        if (isNaN(numberValue)) {
          inputEl.value = 0;
          return;
        }
  
        // If the value is less than 0, set the value to 0
        if (numberValue < 0) {
          inputEl.value = 0;
          return;
        }
      }
  
      if (
        !this.util.hasClass(this.context.addPricingTable.targetButton, "active")
      ) {
        const tableContent = `
            <table class="pricing-table" style="border-collapse: collapse; width: 100%;">
              <thead>
                <tr>
                  <th style="border: 1px solid #ccc">Name</th>
                  <th style="border: 1px solid #ccc">Price</th>
                  <th style="border: 1px solid #ccc">Quantity</th>
                  <th style="border: 1px solid #ccc">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td contenteditable="false" class="td-container" style="border: 1px solid #ccc"><input rowId="0" cellId="0" type="text" value="" placeholder="Enter Name" class="input-pricing-table"></td>
                  <td contenteditable="false" class="td-container" style="border: 1px solid #ccc"><input rowId="0" cellId="1" type="number" value="0" class="input-pricing-table"></td>
                  <td contenteditable="false" class="td-container" style="border: 1px solid #ccc"><input rowId="0" cellId="2" type="number" value="0" class="input-pricing-table"></td>
                  <td contenteditable="false" style="border: 1px solid #ccc">0</td>
                  <td contenteditable="false">
                    <button rowId="0" class="delete-row-btn" style="width: 100%">X</button>
                  </td>
                </tr>
                <tr>
                  <td contenteditable="false" class="td-container" style="border: 1px solid #ccc"><input rowId="1" cellId="0" type="text" value="" placeholder="Enter Name" class="input-pricing-table"></td>
                  <td contenteditable="false" class="td-container" style="border: 1px solid #ccc"><input rowId="1" cellId="1" type="number" value="0" class="input-pricing-table"></td>
                  <td contenteditable="false" class="td-container" style="border: 1px solid #ccc"><input rowId="1" cellId="2" type="number" value="0" class="input-pricing-table"></td>
                  <td contenteditable="false" style="border: 1px solid #ccc">0</td>
                  <td contenteditable="false">
                    <button rowId="1" class="delete-row-btn" style="width: 100%">X</button>
                  </td>
                </tr>
                <tr contenteditable="false">
                  <td contenteditable="false" colspan="4">
                    <button id="add-row-btn">+Add Row</button>
                  </td>
                </tr>
                <tr contenteditable="false">
                  <td contenteditable="false"></td>
                  <td contenteditable="false"></td>
                  <td contenteditable="false" style="border: 1px solid #ccc"><strong>Subtotal</strong></td>
                  <td contenteditable="false" style="border: 1px solid #ccc">0</td>
                </tr>
                <tr contenteditable="false">
                  <td contenteditable="false"></td>
                  <td contenteditable="false"></td>
                  <td contenteditable="false" style="border: 1px solid #ccc"><strong>Discount (%)</strong></td>
                  <td contenteditable="false" class="td-container" style="border: 1px solid #ccc"><input cellId="discount" type="number" value="0" class="input-pricing-table"/></td>
                </tr>
                <tr contenteditable="false">
                  <td contenteditable="false"></td>
                  <td contenteditable="false"></td>
                  <td contenteditable="false" style="border: 1px solid #ccc"><strong>Tax (%)</strong></td>
                  <td contenteditable="false" class="td-container" style="border: 1px solid #ccc"><input cellId="tax" type="number" value="0" class="input-pricing-table" /></td>
                </tr>
                <tr contenteditable="false">
                  <td contenteditable="false"></td>
                  <td contenteditable="false"></td>
                  <td contenteditable="false" style="border: 1px solid #ccc"><strong>Total</strong></td>
                  <td contenteditable="false" style="border: 1px solid #ccc">0</td>
                </tr>
              </tbody>
            </table>
          `;
  
        const newNode = this.util.createElement("DIV");
        newNode.innerHTML = tableContent;
        newNode.classList.add("pricing-table-wrapper");
        this.insertNode(newNode);
  
        const tables = document.querySelectorAll(".pricing-table");
  
        if (tables) {
          Array.from(tables).forEach((table) => {
            const rows = table.tBodies[0].rows;
            const taxInput = rows[rows.length - 2].cells[3].querySelector(
              "input"
            );
            const discountInput = rows[rows.length - 3].cells[3].querySelector(
              "input"
            );
  
            // table.addEventListener("input", (e) => {
            //   if (e.target.tagName === "INPUT" && e.target.type === "number") {
            //     restrictNegativeNums(e.target);
            //   }
            //   updateRowTotal(
            //     rows,
            //     e.target.getAttribute("rowId"),
            //     e.target.getAttribute("cellId"),
            //     e.target.value,
            //     taxInput,
            //     discountInput
            //   );
            // });
  
            // table.addEventListener("click", (e) => {
            //   e.stopPropagation();
            // });
            // add event listener to add row button
            const addNewRowBtn = table.querySelector("#add-row-btn");
            addNewRowBtn.innerHTML =
              '<span style="display: flex; justify-content: center; align-items: center"><i class="ri-add-circle-line"></i> Add Row</span>';
            addNewRowBtn.addEventListener("click", () => addNewRow(table));
  
            // add event listener to each delete button
            const deleteButtons = table.querySelectorAll(".delete-row-btn");
            deleteButtons.forEach((button) => {
              button.innerHTML = '<i class="ri-delete-bin-line"></i>';
              button.addEventListener("click", (e) => deleteRow(e, table));
            });
  
            // for (let i = 0; i < rows.length - 5; i++) {
            //   const priceInput = rows[i].cells[1].querySelector('input');
            //   const quantityInput = rows[i].cells[2].querySelector('input');
            //   const totalCell = rows[i].cells[3];
  
            //   let price = parseFloat(priceInput.value);
            //   let quantity = parseInt(quantityInput.value);
            //   let total = price * quantity;
            //   totalCell.textContent = total.toFixed(2);
            // }
  
            // updateSubTotal(rows, taxInput, discountInput);
          });
        }
      } else {
        this.nodeChange(null, ["background-color"], ["table"], true);
      }
    }
  };
  