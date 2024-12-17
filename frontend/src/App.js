// This is the main file containing the core of the application.
// It holds major routes and renders pages as components.

import React, { Component } from "react";
import { Route, BrowserRouter } from "react-router-dom";
import "./App.css";
import Home from "./Pages/Home";
import Shop from "./Pages/Shop";
import Product from "./Pages/Product";
import Cart from "./Pages/Cart";
import Login from "./Pages/Login";
import Profile from "./Pages/Profile";
import AddProduct from "./Pages/AddProduct";
import ChangePrice from "./Pages/ChangePrice";
import TnC from "./Pages/T&C";
import AboutUs from "./Pages/AboutUs";
import Contact from "./Pages/Contact";
import ARViewerPage from "./Pages/ARViewerPage";
import NavbarComp from "./components/navbar";
import FooterComp from "./components/footer";
import EditProduct from "./Pages/EditProduct";


class App extends Component {
  render() {
    return (
      <BrowserRouter>
      <div style={{width: "100%"}}>
        <NavbarComp />
      </div>

        <Route path="/" exact component={Home} />
        <Route path="/products" exact component={Shop} />
        <Route path="/product/" component={Product} />
        <Route path="/cart" component={Cart} />
        <Route path="/login" component={Login} />
        <Route path="/profile" component={Profile} />
        <Route path="/addproduct" exact component={AddProduct} />
        <Route path="/changeprice" exact component={ChangePrice} />
        <Route path="/terms-and-conditions" component={TnC} />
        <Route path="/about-us" component={AboutUs} />
        <Route path="/contact-us" component={Contact} />
        <Route path="/ar-viewer" element={<ARViewerPage />} />
        <Route path="/EditProduct" exact component={EditProduct} />

        <FooterComp />
      </BrowserRouter>
    );
  }
}

export default App;
