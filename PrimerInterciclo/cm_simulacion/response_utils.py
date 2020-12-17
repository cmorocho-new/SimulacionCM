from flask import Response, json
from werkzeug.wrappers import BaseResponse


class ResponseJSON(Response, BaseResponse):
    """
    Case para generar un response json
    """
    default_mimetype = "application/json"

    def __init__(
            self,
            response=None,
            status=None,
            headers=None,
            mimetype=None,
            content_type=None,
            direct_passthrough=False,
    ):
        super().__init__(
            json.dumps(response), status, headers, mimetype, content_type, direct_passthrough
        )
