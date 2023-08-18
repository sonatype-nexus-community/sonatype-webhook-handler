#
# Copyright (c) 2019-present Sonatype, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

FROM node:18-slim

LABEL name="Sonatype Webhook Handler for Sonatype Lifecycle" \
    maintainer="Sonatype Community <community-group@sonatype.com>" \
    vendor="Sonatype Community <community-group@sonatype.com>"

USER node

COPY node_modules /home/node/app/node_modules
COPY lib/* /home/node/app

EXPOSE 3000

CMD [ "node", "/home/node/app/index.js" ]