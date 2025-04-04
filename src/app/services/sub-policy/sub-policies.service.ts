import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';
import { LocalStorageService } from '../local-storage/local-storage.service';

export enum SubPolicyEndPoint {
  SUB_POLICY = '/sub-policy',
  SUB_POLICY_LIST = '/sub-policy/list',
  SUB_POLICY_DELETE = '/sub-policy/delete',
  GET_QUESTION_LIST = '/question/list',
  DELETE_QUESTION = '/question/delete',
  CREATE_QUESTION = '/question/create',
  SUB_POLICY_SETTING = '/policy-setting/upsert',
  GET_SUB_POLICY_SETTING = '/policy-setting/detail',
  GET_QUESTION_DETAILS = '/question/detail',
  UPDATE_QUESTION = '/question/update',
  SAVE_ANS = '/answer/save',
  GET_COUNT_DATA = '/result/admin-test-employee-list',
  GET_COUNT_DATA_FOR_INFO = '/accept-term-condition/get-sub-policy-condition-list',
  SUB_POLICY_DETAILS = '/sub-policy/detail',
  UPDATE_SUB_POLICY = '/sub-policy/update/',
  TEST_QUESTION_LIST = '/answer/get-test-question-list',
  ACCEPT_TERMS = "/accept-term-condition/save",
  GET_ACCEPT_TERMS_DETAILS = "/accept-term-condition/detail",
}

@Injectable({
  providedIn: 'root',
})
export class SubPoliciesService {
  baseUrl!: string;

  constructor(
    private httpClient: HttpClient,
    private localStorageService: LocalStorageService
  ) {
    this.baseUrl = environment.baseUrl;
  }

  getHeader(): HttpHeaders {
    let token = this.localStorageService.getLoggerToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '', // Add token if it exists
    });
    return headers;
  }

  getTestQuestionList(payload: any): Observable<any> {
    return this.httpClient.post<any>(
      this.baseUrl + SubPolicyEndPoint.TEST_QUESTION_LIST,
      payload,
      {
        headers: this.getHeader(),
      }
    );
  }

  getSubPolicyList(payload: any): Observable<any> {
    return this.httpClient.post<any>(
      this.baseUrl + SubPolicyEndPoint.SUB_POLICY_LIST,
      payload,
      {
        headers: this.getHeader(),
      }
    );
  }

  getSubPolicyDetails(payload: any): Observable<any> {
    return this.httpClient.post<any>(
      this.baseUrl + SubPolicyEndPoint.SUB_POLICY_DETAILS,
      payload,
      {
        headers: this.getHeader(),
      }
    );
  }

  getSubPolicyCountAndData(payload: any): Observable<any> {
    return this.httpClient.post<any>(
      this.baseUrl + SubPolicyEndPoint.GET_COUNT_DATA,
      payload,
      {
        headers: this.getHeader(),
      }
    );
  }

  getSubPolicyCountAndDataForInformation(payload: any): Observable<any> {
    return this.httpClient.post<any>(
      this.baseUrl + SubPolicyEndPoint.GET_COUNT_DATA_FOR_INFO,
      payload,
      {
        headers: this.getHeader(),
      }
    );
  }

  getPolicyDetails(id: string, payload?: any): Observable<any> {
    return this.httpClient.post<any>(
      this.baseUrl + SubPolicyEndPoint.SUB_POLICY + '/detail',
      {
        id, ...payload
      },
      { headers: this.getHeader() }
    );
  }

  createPolicy(payload: any): Observable<any> {
    return this.httpClient.post<any>(
      this.baseUrl + SubPolicyEndPoint.SUB_POLICY,
      payload,
      { headers: this.getHeader() }
    );
  }

  updatePolicy(id: string, payload: any): Observable<any> {
    return this.httpClient.post<any>(
      this.baseUrl + SubPolicyEndPoint.UPDATE_SUB_POLICY + id,
      payload,
      { headers: this.getHeader() }
    );
  }

  deleteSubPolicy(id: any): Observable<any> {
    return this.httpClient.post<any>(
      this.baseUrl + SubPolicyEndPoint.SUB_POLICY_DELETE,
      id,
      {
        headers: this.getHeader(),
      }
    );
  }

  // Question list
  getQuestionList(payload: any): Observable<any> {
    return this.httpClient.post<any>(
      this.baseUrl + SubPolicyEndPoint.GET_QUESTION_LIST,
      payload,
      { headers: this.getHeader() }
    );
  }

  deleteQuestion(id: any): Observable<any> {
    return this.httpClient.post<any>(
      this.baseUrl + SubPolicyEndPoint.DELETE_QUESTION,
      id,
      {
        headers: this.getHeader(),
      }
    );
  }

  acceptTerms(payload: any): Observable<any> {
    return this.httpClient.post<any>(
      this.baseUrl + SubPolicyEndPoint.ACCEPT_TERMS,
      payload,
      {
        headers: this.getHeader(),
      }
    );
  }


  createQuestion(payload: any): Observable<any> {
    return this.httpClient.post<any>(
      this.baseUrl + SubPolicyEndPoint.CREATE_QUESTION,
      payload,
      {
        headers: this.getHeader(),
      }
    );
  }

  updatePolicySetting(payload: any): Observable<any> {
    return this.httpClient.post<any>(
      this.baseUrl + SubPolicyEndPoint.SUB_POLICY_SETTING,
      payload,
      {
        headers: this.getHeader(),
      }
    );
  }

  getPolicySetting(payload: any): Observable<any> {
    return this.httpClient.post<any>(
      this.baseUrl + SubPolicyEndPoint.GET_SUB_POLICY_SETTING,
      payload,
      {
        headers: this.getHeader(),
      }
    );
  }

  getQuestionDetails(id: any): Observable<any> {
    return this.httpClient.post<any>(
      this.baseUrl + SubPolicyEndPoint.GET_QUESTION_DETAILS,
      id,
      { headers: this.getHeader() }
    );
  }

  updateQuestion(payload: any): Observable<any> {
    return this.httpClient.post<any>(
      this.baseUrl + SubPolicyEndPoint.UPDATE_QUESTION,
      payload,
      {
        headers: this.getHeader(),
      }
    );
  }

  saveAnswer(payload: any): Observable<any> {
    return this.httpClient.post<any>(
      this.baseUrl + SubPolicyEndPoint.SAVE_ANS,
      payload,
      {
        headers: this.getHeader(),
      }
    );
  }

  getCurrentIp(): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*'
      })
    };
    return this.httpClient.get<any>('https://api.ipify.org/?format=json', httpOptions);
  }

  getFallbackIp(): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*'
      })
    };
    // Use a different IP service as fallback
    return this.httpClient.get<any>('https://api.ipdata.co/?api-key=test', httpOptions);
  }

  getAcceptTermsDetails(payload: any): Observable<any> {
    return this.httpClient.post<any>(
      this.baseUrl + SubPolicyEndPoint.GET_ACCEPT_TERMS_DETAILS,
      payload,
      {
        headers: this.getHeader(),
      }
    );
  }

}
