const path = require("path");
const fs = require("fs");

const Product = require("../../models/Product");
const Category = require("../../models/Category");
const slugify = require("../../utilities/helpers/slugify");
const buildFileUrl = require("../../utilities/helpers/file-url");
const { handlers } = require("../../utilities/handlers/handlers");
const { sendValidationError } = require("../../utilities/validations/common-validations");

class Service {
  getFilePathFromUrl(fileUrl) {
    try {
      if (!fileUrl) return "";

      const normalizedUrl = String(fileUrl).replace(/\\/g, "/");
      const uploadsMarker = "/uploads/";
      const uploadsIndex = normalizedUrl.indexOf(uploadsMarker);

      if (uploadsIndex === -1) return "";

      const relativeUploadsPath = normalizedUrl.substring(uploadsIndex + 1);
      return path.join(process.cwd(), relativeUploadsPath);
    } catch (error) {
      handlers.logger.error({
        object_type: "product_get_file_path_from_url",
        message: error.message,
      });
      return "";
    }
  }

  removeFileIfExists(filePath) {
    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      handlers.logger.error({
        object_type: "product_remove_file_if_exists",
        message: error.message,
      });
    }
  }

  removeMultipleFiles(fileUrls = []) {
    try {
      fileUrls.forEach((url) => {
        const filePath = this.getFilePathFromUrl(url);
        this.removeFileIfExists(filePath);
      });
    } catch (error) {
      handlers.logger.error({
        object_type: "product_remove_multiple_files",
        message: error.message,
      });
    }
  }

  async createProduct(req, res) {
    try {
      const {
        title,
        short_description,
        description,
        category_id,
        price,
        compare_price,
        stock,
        sku,
        is_featured,
        is_active,
        sizes,
        colors,
      } = req.body;

      const errors = [];

      if (!title || !title.trim()) {
        errors.push({ field: "title", message: "Title is required" });
      }

      if (!category_id || !category_id.trim()) {
        errors.push({ field: "category_id", message: "Category is required" });
      }

      if (price === undefined || price === null || price === "") {
        errors.push({ field: "price", message: "Price is required" });
      } else if (isNaN(price)) {
        errors.push({ field: "price", message: "Valid price is required" });
      }

      if (errors.length > 0) {
        return sendValidationError({ res, errors });
      }

      const category = await Category.findById(category_id);
      if (!category) {
        return handlers.response.unavailable({
          res,
          code: 404,
          message: "Category not found",
        });
      }

      const slug = slugify(title);

      const existingProduct = await Product.findOne({ slug });
      if (existingProduct) {
        return handlers.response.failed({
          res,
          code: 400,
          message: "Product already exists",
        });
      }

      const imagePaths = (req.files || []).map((file) =>
        buildFileUrl(req, file.path)
      );

      const product = await Product.create({
        title: title.trim(),
        slug,
        short_description: short_description || "",
        description: description || "",
        category_id,
        images: imagePaths,
        price: Number(price),
        compare_price: compare_price ? Number(compare_price) : 0,
        stock: stock ? Number(stock) : 0,
        sku: sku || "",
        sizes: sizes ? JSON.parse(sizes) : [],
        colors: colors ? JSON.parse(colors) : [],
        is_featured: String(is_featured) === "true",
        is_active:
          typeof is_active === "undefined" ? true : String(is_active) === "true",
      });

      const populatedProduct = await Product.findById(product._id).populate(
        "category_id",
        "name slug"
      );

      return handlers.response.success({
        res,
        code: 201,
        message: "Product created successfully",
        data: populatedProduct,
      });
    } catch (error) {
      handlers.logger.error({
        object_type: "create_product",
        message: error.message,
      });

      return handlers.response.error({
        res,
        message: "Internal server error",
      });
    }
  }

  async getAllProducts(req, res) {
    try {
      const products = await Product.find()
        .populate("category_id", "name slug")
        .sort({ createdAt: -1 });

      return handlers.response.success({
        res,
        message: "Products retrieved successfully",
        data: products,
      });
    } catch (error) {
      handlers.logger.error({
        object_type: "get_all_products",
        message: error.message,
      });

      return handlers.response.error({
        res,
        message: "Internal server error",
      });
    }
  }

  async getProduct(req, res) {
    try {
      const { id } = req.params;

      const product = await Product.findById(id).populate(
        "category_id",
        "name slug"
      );

      if (!product) {
        return handlers.response.unavailable({
          res,
          code: 404,
          message: "Product not found",
        });
      }

      return handlers.response.success({
        res,
        message: "Product retrieved successfully",
        data: product,
      });
    } catch (error) {
      handlers.logger.error({
        object_type: "get_product",
        message: error.message,
      });

      return handlers.response.error({
        res,
        message: "Internal server error",
      });
    }
  }

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        short_description,
        description,
        category_id,
        price,
        compare_price,
        stock,
        sku,
        is_featured,
        is_active,
        sizes,
        colors,
        keep_existing_images,
        remove_all_images,
      } = req.body;

      const errors = [];

      if (!id) {
        errors.push({ field: "id", message: "Product id is required" });
      }

      if (title !== undefined && !String(title).trim()) {
        errors.push({ field: "title", message: "Title can not be empty" });
      }

      if (price !== undefined && isNaN(price)) {
        errors.push({ field: "price", message: "Valid price is required" });
      }

      if (errors.length > 0) {
        return sendValidationError({ res, errors });
      }

      const product = await Product.findById(id);

      if (!product) {
        return handlers.response.unavailable({
          res,
          code: 404,
          message: "Product not found",
        });
      }

      if (category_id) {
        const category = await Category.findById(category_id);
        if (!category) {
          return handlers.response.unavailable({
            res,
            code: 404,
            message: "Category not found",
          });
        }
        product.category_id = category_id;
      }

      if (title !== undefined && String(title).trim()) {
        const newSlug = slugify(title);

        const existingProduct = await Product.findOne({
          slug: newSlug,
          _id: { $ne: id },
        });

        if (existingProduct) {
          return handlers.response.failed({
            res,
            code: 400,
            message: "Product already exists",
          });
        }

        product.title = String(title).trim();
        product.slug = newSlug;
      }

      if (short_description !== undefined) {
        product.short_description = short_description;
      }

      if (description !== undefined) {
        product.description = description;
      }

      if (price !== undefined) {
        product.price = Number(price);
      }

      if (compare_price !== undefined) {
        product.compare_price = Number(compare_price || 0);
      }

      if (stock !== undefined) {
        product.stock = Number(stock || 0);
      }

      if (sku !== undefined) {
        product.sku = sku;
      }

      if (sizes !== undefined) {
        product.sizes = sizes ? JSON.parse(sizes) : [];
      }

      if (colors !== undefined) {
        product.colors = colors ? JSON.parse(colors) : [];
      }

      if (typeof is_featured !== "undefined") {
        product.is_featured = String(is_featured) === "true";
      }

      if (typeof is_active !== "undefined") {
        product.is_active = String(is_active) === "true";
      }

      let keptImages = product.images || [];

      if (typeof keep_existing_images !== "undefined") {
        let parsedKeepImages = [];

        try {
          parsedKeepImages = keep_existing_images
            ? JSON.parse(keep_existing_images)
            : [];
        } catch (error) {
          return sendValidationError({
            res,
            errors: [
              {
                field: "keep_existing_images",
                message: "keep_existing_images must be valid JSON array",
              },
            ],
          });
        }

        const removedImages = (product.images || []).filter(
          (img) => !parsedKeepImages.includes(img)
        );

        this.removeMultipleFiles(removedImages);
        keptImages = parsedKeepImages;
      }

      if (String(remove_all_images) === "true") {
        this.removeMultipleFiles(product.images || []);
        keptImages = [];
      }

      const newUploadedImages = (req.files || []).map((file) =>
        buildFileUrl(req, file.path)
      );

      product.images = [...keptImages, ...newUploadedImages];

      await product.save();

      const populatedProduct = await Product.findById(product._id).populate(
        "category_id",
        "name slug"
      );

      return handlers.response.success({
        res,
        message: "Product updated successfully",
        data: populatedProduct,
      });
    } catch (error) {
      handlers.logger.error({
        object_type: "update_product",
        message: error.message,
      });

      return handlers.response.error({
        res,
        message: "Internal server error",
      });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);

      if (!product) {
        return handlers.response.unavailable({
          res,
          code: 404,
          message: "Product not found",
        });
      }

      this.removeMultipleFiles(product.images || []);
      await product.deleteOne();

      return handlers.response.success({
        res,
        message: "Product deleted successfully",
      });
    } catch (error) {
      handlers.logger.error({
        object_type: "delete_product",
        message: error.message,
      });

      return handlers.response.error({
        res,
        message: "Internal server error",
      });
    }
  }
}

module.exports = new Service();