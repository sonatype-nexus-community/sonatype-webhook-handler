/*
 * Copyright (c) 2019-present Sonatype, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, expect, test } from '@jest/globals'
import { getIqUrlForApplicationEvaluation, validateWebHookEventType } from './iq'
import { IqWebhookEvent } from '../constants'
import { UnknownWebHookEventType } from '../error'

describe('Test getIqUrlForApplicationEvaluation()', () => {

    const iqServerUrl = 'https://nothing.tld'

    const payload1 = {
        "timestamp": "2020-04-22T18:30:04.673+0000",
        "initiator": "admin",
        "id": "d5cc2e91d6454545841da5599d3c7156",
        "applicationEvaluation": {
            "application": {
                "id": "0f256982c80b4e13abef4917b93ac343",
                "publicId": "My-Application-ID",
                "name": "App Name",
                "organizationId": "f25acda2a413ab2c62b44917b93ac232"
            },
            "policyEvaluationId": "d5cc2e91d6454545841da5599d3c7156",
            "stage": "release",
            "ownerId": "0f256982c80b4e13abef4917b93ac343",
            "evaluationDate": "2020-04-22T18:30:04.404+0000",
            "affectedComponentCount": 999,
            "criticalComponentCount": 9,
            "severeComponentCount": 9,
            "moderateComponentCount": 9,
            "outcome": "fail",
            "reportId": "36f37cf776dd408bacd063450ab04f71"
        }
    }

    const payload2 = {
        "timestamp": "2020-04-22T18:30:04.673+0000",
        "initiator": "admin",
        "id": "d5cc2e91d6454545841da5599d3c7156",
        "applicationEvaluation": {
            "application": {
                "id": "0f256982c80b4e13abef4917b93ac34",
                "publicId": "My-Application-ID-2",
                "name": "App Name",
                "organizationId": "f25acda2a413ab2c62b44917b93ac232"
            },
            "policyEvaluationId": "d5cc2e91d6454545841da5599d3c7156",
            "stage": "release",
            "ownerId": "0f256982c80b4e13abef4917b93ac343",
            "evaluationDate": "2020-04-22T18:30:04.404+0000",
            "affectedComponentCount": 999,
            "criticalComponentCount": 9,
            "severeComponentCount": 9,
            "moderateComponentCount": 9,
            "outcome": "fail",
            "reportId": "36f37cf776dd408bacd063450ab04f72"
        }
    }

    test('Success 1', () => { 
        expect(getIqUrlForApplicationEvaluation(iqServerUrl, payload1)).toBe(`${iqServerUrl}/assets/index.html#/applicationReport/${payload1.applicationEvaluation.application.publicId}/${payload1.applicationEvaluation.reportId}/policy`)
    })

    test('Success 2', () => { 
        expect(getIqUrlForApplicationEvaluation(iqServerUrl, payload2)).toBe(`${iqServerUrl}/assets/index.html#/applicationReport/${payload2.applicationEvaluation.application.publicId}/${payload2.applicationEvaluation.reportId}/policy`)
    })

    test('Failure - Incorrect IQ Server URL', () => { 
        expect(getIqUrlForApplicationEvaluation(iqServerUrl, payload1)).not.toBe(`https://iq.other.tld/assets/index.html#/applicationReport/${payload2.applicationEvaluation.application.publicId}/${payload2.applicationEvaluation.reportId}/policy`)
    })

    test('Failure - Incorrect application.publicId', () => { 
        expect(getIqUrlForApplicationEvaluation(iqServerUrl, payload2)).not.toBe(`${iqServerUrl}/assets/index.html#/applicationReport/${payload1.applicationEvaluation.application.publicId}/${payload2.applicationEvaluation.reportId}/policy`)
    })

    test('Failure - Incorrect reportId', () => { 
        expect(getIqUrlForApplicationEvaluation(iqServerUrl, payload2)).not.toBe(`${iqServerUrl}/assets/index.html#/applicationReport/${payload2.applicationEvaluation.application.publicId}/${payload1.applicationEvaluation.reportId}/policy`)
    })
})

describe('Test validateWebHookEventType()', () => {

    test('Valid - APPLICATION_EVALUATION', () => { 
        expect(validateWebHookEventType('iq:applicationEvaluation')).toBe(IqWebhookEvent.APPLICATION_EVALUATION)
    })

    test('Valid - WAIVER_REQUEST', () => { 
        expect(validateWebHookEventType('iq:waiverRequest')).toBe(IqWebhookEvent.WAIVER_REQUEST)
    })

    test('Invalid - Error', () => {
        expect(() => { 
            validateWebHookEventType('RUBBISH')
        }).toThrowError(UnknownWebHookEventType)
    })
})