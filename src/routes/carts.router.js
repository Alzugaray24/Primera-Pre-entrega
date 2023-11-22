// carts.router
import { Router } from 'express';
import { products } from './products.router.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const cartRouter = Router();

const cartsFilePath = 'carts.json';

const readCartsFromFile = () => {
  try {
    const data = fs.readFileSync(cartsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeCartsToFile = (carts) => {
  fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2), 'utf-8');
};

const carts = readCartsFromFile();

cartRouter.get('/', (req, res) => {
  res.json({
    carts: carts,
  });
});

cartRouter.post('/', (req, res) => {
  const { idProduct } = req.body;

  if (!idProduct) {
    return res
      .status(400)
      .json({
        error: 'Debe ingresar el producto que quiere agregar al carrito',
      });
  }

  const product = products.find((el) => el.id === idProduct);

  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  const cart = {
    idCart: uuidv4(),
    products: [product],
  };

  carts.push(cart);

  writeCartsToFile(carts);

  res.json({
    message: 'El carrito se creó con éxito',
    idCart: cart.idCart,
  });
});

cartRouter.post('/:cid/product/:pid', (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
  
    const cart = carts.find((el) => el.idCart === cid);
  
    if (!cart) {
      console.log('Carrito no encontrado.');
      return res.status(400).json({ error: `El carrito con el id ${cid} no existe` });
    }
  
    const product = products.find((el) => el.id === pid);
  
    if (!product) {
      console.log('Producto no encontrado.');
      return res.status(400).json({ error: `El producto con el id ${pid} no existe` });
    }

  const existingProduct = cart.products.find(
    (item) => item.id === pid
  );

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    const newProduct = {
      id: uuidv4(),
      ...product,
      quantity: 1,
    };

    cart.products.push(newProduct);
  }

  writeCartsToFile(carts);

  res.json({
    message: `Producto con el id ${pid} agregado al carrito con el id ${cid}`,
    cart: cart,
  });
});

cartRouter.get('/:cid', (req, res) => {
  const cid = req.params.cid;

  if (!cid) {
    return res.status(400).json({ error: 'Error al hacer la búsqueda' });
  }

  const carrito = carts.find((el) => el.idCart === cid);

  if (!carrito) {
    return res
      .status(400)
      .json({ error: `El carrito con el id ${cid} no existe` });
  }

  res.json({
    message: 'Carrito encontrado',
    cart: carrito,
  });
});

export default cartRouter;
