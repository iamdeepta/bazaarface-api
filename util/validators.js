module.exports.validateRegisterInput = (
  firstname,
  lastname,
  email,
  password,
  confirmPassword,
  otp,
  country_code,
  phone,
  company_name,
  company_website,
  country,
  city,
  //   isBuyer,
  //   isSeller,
  profile_image,
  cover_image
) => {
  const errors = {};
  if (firstname.trim() === "") {
    errors.firstname = "First name must not be empty";
  }

  if (lastname.trim() === "") {
    errors.lastname = "Last name must not be empty";
  }

  if (otp.trim() === "") {
    errors.otp = "OTP must not be empty";
  }

  if (country_code.trim() === "") {
    errors.country_code = "Country code must not be empty";
  }

  if (phone.trim() === "") {
    errors.phone = "Phone must not be empty";
  }

  if (company_name.trim() === "") {
    errors.company_name = "Company name must not be empty";
  }
  if (company_website.trim() === "") {
    errors.company_website = "Company website must not be empty";
  }
  if (country.trim() === "") {
    errors.country = "Country must not be empty";
  }
  if (city.trim() === "") {
    errors.city = "City must not be empty";
  }

  if (profile_image.trim() === "") {
    errors.profile_image = "Profile image must not be empty";
  }
  if (cover_image.trim() === "") {
    errors.cover_image = "Cover image must not be empty";
  }

  if (email.trim() === "") {
    errors.email = "Email must not be empty";
  } else {
    const regEx =
      /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!email.match(regEx)) {
      errors.email = "Email must be a valid email address";
    }
  }
  if (password === "") {
    errors.password = "Password must not empty";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords must match";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateRegisterInputMobile = (
  firstname,
  email,
  password,
  confirmPassword,
  otp,
  phone
) => {
  const errors_mobile = {};
  if (firstname.trim() === "") {
    errors_mobile.firstname = "First name must not be empty";
  }

  if (otp.trim() === "") {
    errors_mobile.otp = "OTP must not be empty";
  }

  if (phone.trim() === "") {
    errors_mobile.phone = "Phone must not be empty";
  }

  if (email.trim() === "") {
    errors_mobile.email = "Email must not be empty";
  } else {
    const regEx =
      /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!email.match(regEx)) {
      errors_mobile.email = "Email must be a valid email address";
    }
  }
  if (password === "") {
    errors_mobile.password = "Password must not empty";
  } else if (password !== confirmPassword) {
    errors_mobile.confirmPassword = "Passwords must match";
  }

  return {
    errors_mobile,
    valid_mobile: Object.keys(errors_mobile).length < 1,
  };
};

module.exports.validateUserUpdateInput = (
  firstname,
  lastname,
  country_code,
  phone,
  company_name,
  company_website,
  country,
  city,
  // isBuyer,
  // isSeller,
  profile_image,
  cover_image
) => {
  const errors = {};
  if (firstname.trim() === "") {
    errors.firstname = "First name must not be empty";
  }
  if (lastname.trim() === "") {
    errors.lastname = "Last name must not be empty";
  }

  if (country_code.trim() === "") {
    errors.country_code = "Country code must not be empty";
  }
  if (phone.trim() === "") {
    errors.phone = "Phone must not be empty";
  }
  if (company_name.trim() === "") {
    errors.company_name = "Company name must not be empty";
  }
  if (company_website.trim() === "") {
    errors.company_website = "Company website must not be empty";
  }
  if (country.trim() === "") {
    errors.country = "Country must not be empty";
  }
  if (city.trim() === "") {
    errors.city = "City must not be empty";
  }
  if (profile_image.trim() === "") {
    errors.profile_image = "Profile image must not be empty";
  }
  if (cover_image.trim() === "") {
    errors.cover_image = "Cover image must not be empty";
  }
  //   if (email.trim() === "") {
  //     errors.email = "Email must not be empty";
  //   } else {
  //     const regEx =
  //       /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
  //     if (!email.match(regEx)) {
  //       errors.email = "Email must be a valid email address";
  //     }
  //   }
  //   if (password === "") {
  //     errors.password = "Password must not empty";
  //   } else if (password !== confirmPassword) {
  //     errors.confirmPassword = "Passwords must match";
  //   }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateLoginInput = (email, password) => {
  const errors = {};
  if (email.trim() === "") {
    errors.email = "Email must not be empty";
  }
  if (password.trim() === "") {
    errors.password = "Password must not be empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
