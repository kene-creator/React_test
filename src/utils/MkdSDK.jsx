export default function MkdSDK() {
  this._baseurl = "https://reacttask.mkdlabs.com";
  this._project_id = "reacttask";
  this._secret = "d9hedycyv6p7zw8xi34t9bmtsjsigy5t7";
  this._table = "";
  this._custom = "";
  this._method = "";

  const raw = this._project_id + ":" + this._secret;
  let base64Encode = btoa(raw);

  this.setTable = function (table) {
    this._table = table;
  };

  this.login = async function (email, password, role) {
    const payload = {
      email,
      password,
      role,
    };

    const header = this.getHeader();
    console.log(header);
    try {
      const loginResult = await fetch(this._baseurl + "/v2/api/lambda/login", {
        method: "POST",
        headers: header,
        body: JSON.stringify(payload),
      });

      const jsonResponse = await loginResult.json();

      if (loginResult.status === 200) {
        localStorage.setItem("token", jsonResponse.token);
        localStorage.setItem("user", JSON.stringify(jsonResponse));
        return jsonResponse;
      } else {
        throw new Error(jsonResponse.message);
      }
    } catch (error) {
      throw new Error("Login failed.");
    }
  };

  this.getHeader = function () {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      "x-project": base64Encode,
    };
  };

  this.baseUrl = function () {
    return this._baseurl;
  };

  this.callRestAPI = async function (payload, method) {
    const header = {
      "Content-Type": "application/json",
      "x-project": base64Encode,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    switch (method) {
      case "GET":
        const getResult = await fetch(
          this._baseurl + `/v1/api/rest/${this._table}/GET`,
          {
            method: "post",
            headers: header,
            body: JSON.stringify(payload),
          }
        );
        const jsonGet = await getResult.json();

        if (getResult.status === 401) {
          throw new Error(jsonGet.message);
        }

        if (getResult.status === 403) {
          throw new Error(jsonGet.message);
        }
        return jsonGet;

      case "PAGINATE":
        if (!payload.page) {
          payload.page = 1;
        }
        if (!payload.limit) {
          payload.limit = 10;
        }
        const paginateResult = await fetch(
          this._baseurl + `/v1/api/rest/${this._table}/${method}`,
          {
            method: "post",
            headers: header,
            body: JSON.stringify(payload),
          }
        );
        const jsonPaginate = await paginateResult.json();

        if (paginateResult.status === 401) {
          throw new Error(jsonPaginate.message);
        }

        if (paginateResult.status === 403) {
          throw new Error(jsonPaginate.message);
        }
        return jsonPaginate;
      default:
        break;
    }
  };

  this.check = async function (role) {
    const header = this.getHeader();

    try {
      const checkResult = await fetch(this._baseurl + "/v1/api/check", {
        method: "get",
        headers: header,
      });

      if (checkResult.status === 200) {
        const jsonResponse = await checkResult.json();
        if (jsonResponse.role === role) {
          return true;
        } else {
          throw new Error("Access denied.");
        }
      } else {
        throw new Error("Failed to check role.");
      }
    } catch (error) {
      throw new Error("Failed to check role.");
    }
  };

  return this;
}
