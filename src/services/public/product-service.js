const Product = require("../../models/Product");
const Category = require("../../models/Category");
const { handlers } = require("../../utilities/handlers/handlers");

class Service {
  async getAllProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 6,
        search = "",
        category_slug = "",
        category_slugs = "",
        is_featured,
        min_price,
        max_price,
        sizes = "",
        stock = "",
        sort_by = "featured",
        exclude_product_id = "",
      } = req.query;

      const currentPage = Number(page) > 0 ? Number(page) : 1;
      const perPage = Number(limit) > 0 ? Number(limit) : 6;

      const filter = {
        is_active: true,
      };

      if (exclude_product_id && String(exclude_product_id).trim()) {
        filter._id = { $ne: String(exclude_product_id).trim() };
      }

      if (typeof is_featured !== "undefined") {
        filter.is_featured = String(is_featured) === "true";
      }

      if (search && String(search).trim()) {
        const regex = new RegExp(String(search).trim(), "i");

        filter.$or = [
          { title: regex },
          { short_description: regex },
          { description: regex },
          { sku: regex },
          { colors: { $in: [regex] } },
          { sizes: { $in: [regex] } },
        ];
      }

      if (category_slugs && String(category_slugs).trim()) {
        const slugArray = String(category_slugs)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

        const categories = await Category.find({
          slug: { $in: slugArray },
          is_active: true,
        }).select("_id");

        const categoryIds = categories.map((item) => item._id);

        if (categoryIds.length === 0) {
          return handlers.response.success({
            res,
            message: "Products retrieved successfully",
            data: {
              items: [],
              filters_meta: {
                available_sizes: [],
                min_price: 0,
                max_price: 0,
              },
              pagination: {
                total_items: 0,
                total_pages: 0,
                current_page: currentPage,
                per_page: perPage,
                has_next_page: false,
                has_prev_page: currentPage > 1,
              },
            },
          });
        }

        filter.category_id = { $in: categoryIds };
      } else if (category_slug && String(category_slug).trim()) {
        const category = await Category.findOne({
          slug: String(category_slug).trim(),
          is_active: true,
        });

        if (!category) {
          return handlers.response.success({
            res,
            message: "Products retrieved successfully",
            data: {
              items: [],
              filters_meta: {
                available_sizes: [],
                min_price: 0,
                max_price: 0,
              },
              pagination: {
                total_items: 0,
                total_pages: 0,
                current_page: currentPage,
                per_page: perPage,
                has_next_page: false,
                has_prev_page: currentPage > 1,
              },
            },
          });
        }

        filter.category_id = category._id;
      }

      if (min_price !== undefined || max_price !== undefined) {
        filter.price = {};

        if (min_price !== undefined && min_price !== "") {
          filter.price.$gte = Number(min_price);
        }

        if (max_price !== undefined && max_price !== "") {
          filter.price.$lte = Number(max_price);
        }

        if (Object.keys(filter.price).length === 0) {
          delete filter.price;
        }
      }

      if (sizes && String(sizes).trim()) {
        const sizeArray = String(sizes)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

        if (sizeArray.length > 0) {
          filter.sizes = { $in: sizeArray };
        }
      }

      if (stock === "in-stock") {
        filter.stock = { $gt: 0 };
      }

      if (stock === "sold-out") {
        filter.stock = { $lte: 0 };
      }

      let sortConfig = { is_featured: -1, createdAt: -1 };

      switch (sort_by) {
        case "price-low-high":
          sortConfig = { price: 1, createdAt: -1 };
          break;
        case "price-high-low":
          sortConfig = { price: -1, createdAt: -1 };
          break;
        case "name-a-z":
          sortConfig = { title: 1, createdAt: -1 };
          break;
        case "name-z-a":
          sortConfig = { title: -1, createdAt: -1 };
          break;
        case "featured":
        default:
          sortConfig = { is_featured: -1, createdAt: -1 };
          break;
      }

      const totalItems = await Product.countDocuments(filter);
      const totalPages = Math.ceil(totalItems / perPage);
      const skip = (currentPage - 1) * perPage;

      const products = await Product.find(filter)
        .populate("category_id", "name slug")
        .sort(sortConfig)
        .skip(skip)
        .limit(perPage);

      const filteredProductsForMeta = await Product.find(filter).select("sizes price");

      const availableSizes = [
        ...new Set(
          filteredProductsForMeta.flatMap((item) =>
            Array.isArray(item.sizes) ? item.sizes : []
          )
        ),
      ];

      const allPrices = filteredProductsForMeta.map((item) => Number(item.price || 0));
      const minAvailablePrice = allPrices.length ? Math.floor(Math.min(...allPrices)) : 0;
      const maxAvailablePrice = allPrices.length ? Math.ceil(Math.max(...allPrices)) : 0;

      return handlers.response.success({
        res,
        message: "Products retrieved successfully",
        data: {
          items: products,
          filters_meta: {
            available_sizes: availableSizes,
            min_price: minAvailablePrice,
            max_price: maxAvailablePrice,
          },
          pagination: {
            total_items: totalItems,
            total_pages: totalPages,
            current_page: currentPage,
            per_page: perPage,
            has_next_page: currentPage < totalPages,
            has_prev_page: currentPage > 1,
          },
        },
      });
    } catch (error) {
      console.log("getAllProducts error:", error);
      return handlers.response.error({
        res,
        message: "Internal server error",
      });
    }
  }

  async getProduct(req, res) {
    try {
      const { id } = req.params;

      const product = await Product.findOne({
        _id: id,
        is_active: true,
      }).populate("category_id", "name slug");

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
      return handlers.response.error({
        res,
        message: "Internal server error",
      });
    }
  }
}

module.exports = new Service();