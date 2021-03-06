import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Intent } from '@model/intent.model';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Response } from '@model/response.model';
import { ResponseType } from '@enum/response-type.enum';
import { Knowledge } from '@model/knowledge.model';
import { IntentService } from '@core/services/intent.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ConfigService } from '@core/services/config.service';

@Component({
  selector: 'app-intent-form',
  templateUrl: './intent-form.component.html',
  styleUrls: ['./intent-form.component.scss']
})
export class IntentFormComponent implements OnInit {

  @Input() intent: Intent;
  @Input() redirect = true;
  @Output() close: EventEmitter<Intent> = new EventEmitter<Intent>();

  intentForm: FormGroup;

  panelHeight = '30px';

  constructor(private _fb: FormBuilder,
              private _toastr: ToastrService,
              private _router: Router,
              private _intentService: IntentService,
              private _configService: ConfigService) {
  }

  ngOnInit(): void {
    this._initForm();
  }

  get controls() {
    return this.intentForm.controls;
  }

  get isNewIntent(): boolean {
    return this.intentForm.get('isNewIntent').value;
  }

  get responsesFormArray(): FormArray {
    return <FormArray> this.intentForm.get('responses');
  }

  get knowledgesFormArray(): FormArray {
    return <FormArray> this.intentForm.get('knowledges');
  }

  resetValue(controlName) {
    this.intentForm.get(controlName).setValue(null);
  }

  getTitle() {
    return this.isNewIntent ? 'Créer une nouvelle connaissance' : 'Modifier une connaissance';
  }

  getResponseIdx(idx: number) {
    let idxToReturn = 0;
    for (let i = 0; i <= idx; i++) {
      if (this.showResponseForm(i)) {
        idxToReturn++;
      }
    }
    return idxToReturn;
  }

  addResponse() {
    this.responsesFormArray.push(this._getResponseForm(new Response()));
  }

  addKnowledge() {
    this.knowledgesFormArray.push(this._getKnowledgeForm(new Knowledge()));
  }

  showResponseForm(idx: number): boolean {
    const nextResponse: Response = this.responsesFormArray.at(idx + 1)?.value;
    const response: Response = this.responsesFormArray.at(idx).value;
    return (response.responseType !== ResponseType.text || !nextResponse ||
      ![ResponseType.image, ResponseType.quick_reply, ResponseType.button].includes(nextResponse.responseType));
  }

  canDeleteResponse(): boolean {
    return !(this.responsesFormArray.length <= 1 || (this.responsesFormArray.length === 2 && !this.showResponseForm(1)));
  }

  deleteResponse(idx: number): void {
    if (idx > 0 && !this.showResponseForm(idx - 1)) {
      this.responsesFormArray.removeAt(idx);
      this.responsesFormArray.removeAt(idx - 1);
    } else {
      this.responsesFormArray.removeAt(idx);
    }
  }

  deleteKnowledge(idx: number): void {
    this.knowledgesFormArray.removeAt(idx);
  }

  saveIntent() {
    this._intentService.create({...this.intentForm.getRawValue(), ...{status: this.intent.status}}).subscribe(intent => {
      this._configService.getConfig().subscribe();
      this._toastr.success('Connaissance sauvegardée');
      this.close.emit(intent);
      if (this.redirect) {
        this._router.navigateByUrl('/connaissances');
      }
    });
  }

  cancel() {
    if (this.isNewIntent && this.redirect) {
      return this._router.navigateByUrl('/connaissances');
    }
    this.close.emit(null);
  }

  private _initForm() {
    this.intentForm = this._fb.group({
      isNewIntent: [!this.intent.id],
      id: [this.intent.id, [Validators.required, Validators.pattern('[a-zA-Z0-9_-]*'), Validators.maxLength(100)]],
      mainQuestion: [this.intent.mainQuestion, [Validators.required, Validators.maxLength(255)]],
      category: [this.intent.category, [Validators.maxLength(255)]],
      responses: this._fb.array(this._initResponsesForm()),
      knowledges: this._fb.array(this._initKnowledgesForm()),
      expiresAt: [this.intent.expiresAt]
    });
  }

  private _initResponsesForm(): FormGroup[] {
    const formGroups = [];

    this.intent.responses.forEach(response => {
      formGroups.push(this._getResponseForm(response));
    });

    return formGroups;
  }

  private _initKnowledgesForm(): FormGroup[] {
    const formGroups = [];

    this.intent.knowledges.forEach(knowledge => {
      formGroups.push(this._getKnowledgeForm(knowledge));
    });

    return formGroups;
  }

  private _getResponseForm(response: Response) {
    return this._fb.group({
      id: [response.id],
      responseType: [response.responseType, Validators.required],
      response: [response.response, [Validators.required, Validators.maxLength(2000)]]
    });
  }

  private _getKnowledgeForm(knowledge: Knowledge) {
    return this._fb.group({
      id: [knowledge.id],
      question: [knowledge.question, [Validators.required, Validators.maxLength(255)]]
    });
  }

}
