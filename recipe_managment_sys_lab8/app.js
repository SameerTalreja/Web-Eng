
const els = {
  form: document.getElementById("recipeForm"),
  id: document.getElementById("recipeId"),
  title: document.getElementById("title"),
  ingredients: document.getElementById("ingredients"),
  instructions: document.getElementById("instructions"),
  titleError: document.getElementById("titleError"),
  ingredientsError: document.getElementById("ingredientsError"),
  instructionsError: document.getElementById("instructionsError"),
  drop: document.getElementById("drop"),
  image: document.getElementById("image"),
  preview: document.getElementById("preview"),
  saveBtn: document.getElementById("saveBtn"),
  resetBtn: document.getElementById("resetBtn"),
  toggleForm: document.getElementById("toggleForm"),
  clearAll: document.getElementById("clearAll"),
  formCard: document.getElementById("formCard"),
  formMode: document.getElementById("formMode"),
  list: document.getElementById("recipes"),
  empty: document.getElementById("emptyState"),
  q: document.getElementById("q"),
  seed: document.getElementById("seed"),
  viewModal: document.getElementById("viewModal"),
  viewTitle: document.getElementById("viewTitle"),
  viewContent: document.getElementById("viewContent"),
  closeView: document.getElementById("closeView"),
  viewEdit: document.getElementById("viewEdit"),
  viewDelete: document.getElementById("viewDelete"),
};


let recipes = []; 
const LS_KEY = "recipe_manager_data_v1";


function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    recipes = raw ? JSON.parse(raw) : [];
  } catch {
    recipes = [];
  }
}

function save() {
  localStorage.setItem(LS_KEY, JSON.stringify(recipes));
}


function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function toLines(text) {
  return text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
}

function placeholderImage(title) {
 
  const svg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'>
      <defs>
        <linearGradient id='g' x1='0' x2='1'>
          <stop stop-color='#1d4ed8'/>
          <stop offset='1' stop-color='#22c55e'/>
        </linearGradient>
      </defs>
      <rect width='100%' height='100%' fill='url(#g)'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='36' font-family='Arial' fill='white'>${(title||"Recipe").slice(0,28)}</text>
    </svg>`
  );
  return `data:image/svg+xml;charset=utf-8,${svg}`;
}

function clearErrors() {
  els.titleError.textContent = "";
  els.ingredientsError.textContent = "";
  els.instructionsError.textContent = "";
}

function validate() {
  clearErrors();
  let ok = true;

  if (!els.title.value.trim() || els.title.value.trim().length < 3) {
    els.titleError.textContent = "Title must be at least 3 characters.";
    ok = false;
  }
  if (!els.ingredients.value.trim()) {
    els.ingredientsError.textContent = "Please list at least one ingredient.";
    ok = false;
  }
  if (!els.instructions.value.trim()) {
    els.instructionsError.textContent = "Please provide instructions.";
    ok = false;
  }
  return ok;
}

function resetForm() {
  els.id.value = "";
  els.title.value = "";
  els.ingredients.value = "";
  els.instructions.value = "";
  els.preview.src = "";
  els.preview.style.display = "none";
  els.drop.classList.remove("drag");
  els.formMode.textContent = "Mode: Create";
  clearErrors();
}

function populateForm(recipe) {
  els.id.value = recipe.id;
  els.title.value = recipe.title;
  els.ingredients.value = recipe.ingredients.join("\n");
  els.instructions.value = recipe.instructions;
  if (recipe.image) {
    els.preview.src = recipe.image;
    els.preview.style.display = "block";
  } else {
    els.preview.src = "";
    els.preview.style.display = "none";
  }
  els.formMode.textContent = "Mode: Edit";

  els.title.scrollIntoView({ behavior: "smooth", block: "center" });
}

function renderRecipes(filter = "") {
  const q = filter.trim().toLowerCase();
  let items = recipes.slice().sort((a,b)=>b.createdAt - a.createdAt);

  if (q) {
    items = items.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.ingredients.some(i => i.toLowerCase().includes(q))
    );
  }

  els.list.innerHTML = "";
  if (items.length === 0) {
    els.empty.style.display = "block";
    return;
  }
  els.empty.style.display = "none";

  for (const r of items) {
    const card = document.createElement("div");
    card.className = "recipe";

    const img = document.createElement("img");
    img.src = r.image || placeholderImage(r.title);
    img.alt = r.title;

    const pill = document.createElement("div");
    pill.className = "pill";
    const date = new Date(r.createdAt);
    pill.textContent = date.toLocaleDateString();

    const body = document.createElement("div");
    body.className = "r-body";

    const h3 = document.createElement("h3");
    h3.textContent = r.title;

    const muted = document.createElement("div");
    muted.className = "muted";
    muted.textContent = `${r.ingredients.length} ingredient${r.ingredients.length>1?"s":""}`;

    const actions = document.createElement("div");
    actions.className = "actions";
    const viewBtn = document.createElement("button");
    viewBtn.className = "btn btn-secondary";
    viewBtn.textContent = "View";
    viewBtn.onclick = () => openView(r.id);

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-accent";
    editBtn.textContent = "Edit";
    editBtn.onclick = () => populateForm(r);

    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-danger";
    delBtn.textContent = "Delete";
    delBtn.onclick = () => deleteRecipe(r.id);

    actions.append(viewBtn, editBtn, delBtn);
    body.append(h3, muted, actions);
    card.append(img, pill, body);
    els.list.append(card);
  }
}

function addRecipe({ title, ingredients, instructions, image }) {
  const rec = {
    id: uid(),
    title: title.trim(),
    ingredients: ingredients,
    instructions: instructions.trim(),
    image: image || null,
    createdAt: Date.now(),
  };
  recipes.push(rec);
  save();
  renderRecipes(els.q.value);
}

function updateRecipe(id, { title, ingredients, instructions, image }) {
  const idx = recipes.findIndex(r => r.id === id);
  if (idx === -1) return;
  recipes[idx] = {
    ...recipes[idx],
    title: title.trim(),
    ingredients,
    instructions: instructions.trim(),
    image: image ?? recipes[idx].image,
  };
  save();
  renderRecipes(els.q.value);
}

function deleteRecipe(id) {
  if (!confirm("Delete this recipe?")) return;
  recipes = recipes.filter(r => r.id !== id);
  save();
  renderRecipes(els.q.value);

  if (els.viewModal.open && els.viewModal.dataset.id === id) {
    els.viewModal.close();
  }
}


let pendingImageDataURL = null;

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

async function handleFiles(files) {
  const file = files && files[0];
  if (!file) return;

  if (file.size > 2.5 * 1024 * 1024) {
    alert("Please choose an image smaller than ~2.5MB.");
    return;
  }
  pendingImageDataURL = await fileToDataURL(file);
  els.preview.src = pendingImageDataURL;
  els.preview.style.display = "block";
}

["dragenter", "dragover"].forEach(evt =>
  els.drop.addEventListener(evt, e => {
    e.preventDefault(); e.stopPropagation();
    els.drop.classList.add("drag");
  })
);
["dragleave", "drop"].forEach(evt =>
  els.drop.addEventListener(evt, e => {
    e.preventDefault(); e.stopPropagation();
    els.drop.classList.remove("drag");
  })
);
els.drop.addEventListener("drop", e => {
  const dt = e.dataTransfer;
  if (dt && dt.files) handleFiles(dt.files);
});
els.image.addEventListener("change", e => handleFiles(e.target.files));


els.form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validate()) return;

  const data = {
    title: els.title.value,
    ingredients: toLines(els.ingredients.value),
    instructions: els.instructions.value,
    image: pendingImageDataURL, 
  };

  const editing = !!els.id.value;
  if (editing) {
    updateRecipe(els.id.value, data);
  } else {
    addRecipe(data);
  }
  resetForm();
  pendingImageDataURL = null;
});


els.resetBtn.addEventListener("click", () => {
  resetForm();
  pendingImageDataURL = null;
});


els.toggleForm.addEventListener("click", () => {
  const display = getComputedStyle(els.formCard).display;
  els.formCard.style.display = display === "none" ? "" : "none";
});


els.clearAll.addEventListener("click", () => {
  if (!confirm("This will delete ALL recipes. Continue?")) return;
  recipes = [];
  save();
  renderRecipes(els.q.value);
});


els.q.addEventListener("input", () => renderRecipes(els.q.value));


els.seed.addEventListener("click", () => {
  const samples = [
    {
      title: "Classic Pancakes",
      ingredients: ["1 cup flour", "2 tbsp sugar", "1 tsp baking powder", "1 egg", "3/4 cup milk", "Butter", "Pinch of salt"],
      instructions: "Whisk dry ingredients. Add egg and milk, whisk until smooth. Cook on buttered skillet until bubbles form; flip and cook until golden.",
    },
    {
      title: "Garlic Butter Shrimp",
      ingredients: ["300g shrimp", "3 cloves garlic", "2 tbsp butter", "Lemon juice", "Parsley", "Salt", "Pepper"],
      instructions: "Melt butter, sauté garlic, add shrimp, cook 2–3 min each side. Finish with lemon and parsley.",
    },
    {
      title: "Veggie Omelette",
      ingredients: ["3 eggs", "1/4 cup onion", "1/4 cup bell pepper", "Spinach", "Salt", "Pepper", "Olive oil"],
      instructions: "Beat eggs with salt/pepper. Sauté veggies, add eggs, cook until set. Fold and serve.",
    },
  ];
  for (const s of samples) addRecipe({ ...s, image: null });
});


function openView(id) {
  const r = recipes.find(x => x.id === id);
  if (!r) return;
  els.viewModal.dataset.id = id;
  els.viewTitle.textContent = r.title;

  const html = `
    <img src="${r.image || placeholderImage(r.title)}" alt="${r.title}" style="width:100%; height:260px; object-fit:cover; border-radius:12px; border:1px solid #1f2937; margin-bottom:12px" />
    <div class="muted" style="margin:6px 0 10px">${new Date(r.createdAt).toLocaleString()}</div>
    <h4>Ingredients</h4>
    <ul>${r.ingredients.map(i => `<li>${i}</li>`).join("")}</ul>
    <h4>Instructions</h4>
    <pre style="white-space:pre-wrap; font-family:inherit; background:#0b1220; padding:10px; border-radius:10px; border:1px solid #1f2937">${r.instructions}</pre>
  `;
  els.viewContent.innerHTML = html;
  if (typeof els.viewModal.showModal === "function") {
    els.viewModal.showModal();
  } else {

    els.viewModal.setAttribute("open", "");
  }
}

els.closeView.addEventListener("click", () => els.viewModal.close());
els.viewEdit.addEventListener("click", () => {
  const id = els.viewModal.dataset.id;
  const r = recipes.find(x => x.id === id);
  if (r) populateForm(r);
  els.viewModal.close();
});
els.viewDelete.addEventListener("click", () => {
  const id = els.viewModal.dataset.id;
  deleteRecipe(id);
  if (els.viewModal.open) els.viewModal.close();
});

// --- Init ---
(function init(){
  load();
  renderRecipes();

})();
