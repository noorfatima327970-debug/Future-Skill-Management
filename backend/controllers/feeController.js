const Fee = require("../models/Fee");

const calculateFeeValues = (
  totalFee,
  paidAmount,
  dueDate
) => {
  const total = Number(totalFee);
  const paid = Number(paidAmount);

  const remaining = Math.max(total - paid, 0);

  let status = "Unpaid";

  if (paid >= total && total > 0) {
    status = "Paid";
  } else if (paid > 0 && paid < total) {
    status = "Partial";
  }

  if (
    remaining > 0 &&
    dueDate &&
    new Date(dueDate) < new Date()
  ) {
    status = "Overdue";
  }

  return {
    totalFee: total,
    paidAmount: paid,
    remainingAmount: remaining,
    status,
  };
};

const getFees = async (req, res) => {
  try {
    const fees = await Fee.find()
      .sort({
        dueDate: -1,
        className: 1,
        studentName: 1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: fees.length,
      fees,
    });
  } catch (error) {
    console.error("Get Fees Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch fee records",
    });
  }
};

const getFeeById = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }

    return res.status(200).json({
      success: true,
      fee,
    });
  } catch (error) {
    console.error("Get Fee Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch fee record",
    });
  }
};

const createFee = async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      className,
      section,
      month,
      totalFee,
      paidAmount,
      dueDate,
      remarks,
    } = req.body;

    if (
      !studentId ||
      !studentName ||
      !className ||
      !section ||
      !month ||
      totalFee === undefined ||
      !dueDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill all required fee fields",
      });
    }

    const total = Number(totalFee);
    const paid = Number(paidAmount || 0);

    if (
      Number.isNaN(total) ||
      Number.isNaN(paid) ||
      total < 0 ||
      paid < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid fee amount",
      });
    }

    if (paid > total) {
      return res.status(400).json({
        success: false,
        message:
          "Paid amount cannot be greater than total fee",
      });
    }

    const normalizedMonth =
      month.trim();

    const existingFee = await Fee.findOne({
      studentId,
      month: normalizedMonth,
    });

    if (existingFee) {
      return res.status(409).json({
        success: false,
        message:
          "Fee record for this student and month already exists",
      });
    }

    const calculated = calculateFeeValues(
      total,
      paid,
      dueDate
    );

    const fee = await Fee.create({
      studentId,
      studentName: studentName.trim(),
      className: className.trim(),
      section: section
        .trim()
        .toUpperCase(),
      month: normalizedMonth,
      totalFee: calculated.totalFee,
      paidAmount: calculated.paidAmount,
      remainingAmount:
        calculated.remainingAmount,
      dueDate: new Date(dueDate),
      status: calculated.status,
      remarks: remarks?.trim() || "",
    });

    return res.status(201).json({
      success: true,
      message: "Fee record created successfully",
      fee,
    });
  } catch (error) {
    console.error("Create Fee Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Fee record for this student and month already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create fee record",
    });
  }
};

const updateFee = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }

    const {
      studentId,
      studentName,
      className,
      section,
      month,
      totalFee,
      paidAmount,
      dueDate,
      remarks,
    } = req.body;

    if (studentId !== undefined) {
      fee.studentId = studentId;
    }

    if (studentName !== undefined) {
      fee.studentName =
        studentName.trim();
    }

    if (className !== undefined) {
      fee.className =
        className.trim();
    }

    if (section !== undefined) {
      fee.section = section
        .trim()
        .toUpperCase();
    }

    if (month !== undefined) {
      fee.month = month.trim();
    }

    if (totalFee !== undefined) {
      fee.totalFee = Number(totalFee);
    }

    if (paidAmount !== undefined) {
      fee.paidAmount = Number(paidAmount);
    }

    if (dueDate !== undefined) {
      const updatedDueDate =
        new Date(dueDate);

      if (Number.isNaN(updatedDueDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid due date",
        });
      }

      fee.dueDate = updatedDueDate;
    }

    if (remarks !== undefined) {
      fee.remarks = remarks.trim();
    }

    if (
      Number.isNaN(fee.totalFee) ||
      Number.isNaN(fee.paidAmount) ||
      fee.totalFee < 0 ||
      fee.paidAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid fee amount",
      });
    }

    if (fee.paidAmount > fee.totalFee) {
      return res.status(400).json({
        success: false,
        message:
          "Paid amount cannot be greater than total fee",
      });
    }

    const calculated = calculateFeeValues(
      fee.totalFee,
      fee.paidAmount,
      fee.dueDate
    );

    fee.remainingAmount =
      calculated.remainingAmount;

    fee.status = calculated.status;

    const duplicateFee = await Fee.findOne({
      _id: {
        $ne: fee._id,
      },
      studentId: fee.studentId,
      month: fee.month,
    });

    if (duplicateFee) {
      return res.status(409).json({
        success: false,
        message:
          "Fee record for this student and month already exists",
      });
    }

    await fee.save();

    return res.status(200).json({
      success: true,
      message: "Fee record updated successfully",
      fee,
    });
  } catch (error) {
    console.error("Update Fee Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Fee record for this student and month already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update fee record",
    });
  }
};

const deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }

    await Fee.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Fee record deleted successfully",
    });
  } catch (error) {
    console.error("Delete Fee Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete fee record",
    });
  }
};

module.exports = {
  getFees,
  getFeeById,
  createFee,
  updateFee,
  deleteFee,
};