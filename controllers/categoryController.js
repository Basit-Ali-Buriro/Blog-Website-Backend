import Categories from "../models/Categories.js";
import Post from "../models/Post.js";


const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
};

export const getCategories = async (req, res) => {
  try {
    const { limit = 20, page = 1, search } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skipValue = (page - 1) * limit;

    const categories = await Categories.find(query)
      .sort({ name: 1 })
      .skip(skipValue)
      .limit(parseInt(limit));

    const total = await Categories.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      categories,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCategories: total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: "Category Name is required", success: false });
    }

    const existingCategory = await Categories.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }
    const slug = generateSlug(name);

    const newCategory = await Categories.create({
      name: name.trim(),
      description: description || "",
      slug,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    let category = await Categories.findById(id);

    if (!category) {
      category = await Categories.findOne({ slug: id });
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Categories.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Not found", success: false });
    }

    if (name && name !== category.name) {
      const existingCategory = await Categories.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: id },
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Category name already exists",
        });
      }
    }
    const updateData = {};

    if (name) {
      updateData.name = name.trim();
      updateData.slug = generateSlug(name);
    }

    if (description !== undefined) {
      updateData.description = description;
    }
    const updatedCategory = await Categories.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message : "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    if (error.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid category ID format"
        });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCategory = async (req, res) => {
    try {
      const {id} = req.params;

      const category = await Categories.findById(id)
      if(!category){
        return res.status(404).json({message : "Category Not found", success : false})
      }

      const postsUsing = await Post.countDocuments({category : id})
      if(postsUsing > 0){
        return res.status(400).json({success : false, message : "Cannot delete category because it is being used"})

      }

      await Categories.findByIdAndDelete(id)

      res.status(200).json({
        success : true,
        message : "Sucessfully Deleted Category"
      })


    } catch (error) {
      if (error.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid category ID format"
        });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  
    }
  
}