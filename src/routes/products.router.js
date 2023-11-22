// products.router 
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

const productRouter = Router();

const readProductsFromFile = () => {
  try {
    const data = fs.readFileSync("productos.json", "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeProductsToFile = (products) => {
  fs.writeFileSync("productos.json", JSON.stringify(products, null, 2), "utf-8");
};

export const products = readProductsFromFile();

productRouter.get("/", (req, res) => {
  const limit = req.query.limit;

  if (!limit) return res.json({ products });

  if (products.length < limit)
    return res.status(500).json({ error: "No existen tantos productos" });

  const productLimit = products.slice(0, limit);

  res.json({
    productos: productLimit,
  });
});

productRouter.post("/", (req, res) => {
  const { title, description, code, price, stock, category, thumbnails } =
    req.body;

  if (
    !title ||
    !description ||
    !code ||
    price === undefined ||
    stock === undefined ||
    !category
  ) {
    return res.status(400).json({
      error:
        "Todos los campos obligatorios, excepto 'thumbnails', deben ser proporcionados",
    });
  }

  if (
    typeof code !== "string" ||
    typeof price !== "number" ||
    typeof stock !== "number" ||
    typeof category !== "string"
  ) {
    return res
      .status(400)
      .json({ error: "Tipo de datos incorrecto para uno o más campos" });
  }

  const product = {
    id: uuidv4(),
    title: title,
    description: description,
    code: code,
    price: price,
    status: true,
    stock: stock,
    category: category,
    thumbnails: thumbnails || [],
  };

  products.push(product);

  writeProductsToFile(products);

  res.json({
    message: "Producto agregado con éxito",
  });
});

productRouter.put("/:pid", (req, res) => {
  const pid = req.params.pid;

  const index = products.findIndex((el) => el.id === pid);

  if (index === -1) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  products[index] = { ...products[index], ...req.body };

  writeProductsToFile(products);

  res.json({
    message: "Producto actualizado",
  });
});

productRouter.delete("/:pid", (req, res) => {
  const pid = req.params.pid;

  const index = products.findIndex((el) => el.id === pid);

  if (index === -1)
    return res.status(400).json({ error: "El producto a eliminar no existe" });

  products.splice(index, 1);

  writeProductsToFile(products);

  res.json({
    message: "Producto eliminado con éxito",
  });
});

export default productRouter;
